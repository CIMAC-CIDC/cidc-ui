import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import ManifestUpload from "./ManifestUpload";
import { XLSX_MIMETYPE } from "../../util/constants";
import { AuthContext } from "../identity/AuthProvider";
import { InfoContext } from "../info/InfoProvider";
import { apiCreate } from "../../api/api";
jest.mock("../../api/api");

const TOKEN = "BLAH";

function renderWithMockedAuthContext() {
    const fakeInfo = {
        supportedTemplates: { manifests: ["pbmc"], metadata: [] }
    };
    return render(
        <InfoContext.Provider value={fakeInfo}>
            <AuthContext.Provider
                value={{
                    state: "logged-in",
                    userInfo: { idToken: TOKEN }
                }}
            >
                <ManifestUpload cardClass="foo" />
            </AuthContext.Provider>
        </InfoContext.Provider>
    );
}

test("manifest validation", async () => {
    const renderResult = renderWithMockedAuthContext();
    const {
        queryByTestId,
        getByTestId,
        getByText,
        findByTestId
    } = renderResult;
    const pbmcRadio = getByTestId("radio-pbmc");
    const manifestFileInput = getByTestId("manifest-file-input");
    const submitButton = getByTestId("submit-button").closest("button")!;

    function expectNoValidationsDisplayed() {
        expect(queryByTestId("unset")).toBeInTheDocument();
        expect(queryByTestId("validationSuccess")).not.toBeInTheDocument();
        expect(queryByTestId("validationErrors")).not.toBeInTheDocument();
    }

    // Defaults on first render to no validations, disabled submit
    expectNoValidationsDisplayed();
    expect(submitButton.disabled).toBe(true);

    // Select a manifest type. Material UI components make this
    // difficult: we need to first click on the select component,
    // then click on the dropdown option that subsequently appears.
    fireEvent.click(pbmcRadio);
    expectNoValidationsDisplayed();
    expect(submitButton.disabled).toBe(true);

    async function doValidationRequest(element: string) {
        fireEvent.click(manifestFileInput);

        const fakePBMCFile = new File(["foo"], "pbmc.xlsx", {
            type: XLSX_MIMETYPE
        });
        fireEvent.change(manifestFileInput, {
            target: { files: [fakePBMCFile] }
        });

        expect(submitButton.disabled).toBe(true);

        await findByTestId(element);
        expect(queryByTestId("unset")).not.toBeInTheDocument();
    }

    // Check that validation errors show up and submit button is still disabled
    const errors = ["a", "b", "c"];
    apiCreate.mockRejectedValue({
        response: { data: { _error: { message: { errors } } } }
    });
    await doValidationRequest("validationErrors");
    errors.forEach(e => expect(getByText(e)).toBeInTheDocument());
    expect(queryByTestId("validationSuccess")).not.toBeInTheDocument();
    expect(submitButton.disabled).toBe(true);

    // Check that valid message shows up and submit button is enabled
    apiCreate.mockResolvedValue({ errors: [] });
    await doValidationRequest("validationSuccess");
    expect(queryByTestId("validationSuccess")).toBeInTheDocument();
    expect(queryByTestId("validationErrors")).not.toBeInTheDocument();
    expect(submitButton.disabled).toBe(false);
});

test("manifest submission", async () => {
    const renderResult = renderWithMockedAuthContext();
    const {
        findByTestId,
        queryByTestId,
        queryByText,
        getByTestId
    } = renderResult;
    const pbmcRadio = getByTestId("radio-pbmc");
    const manifestFileInput = getByTestId("manifest-file-input");
    const submitButton = getByTestId("submit-button");

    const uploadFile = async () => {
        fireEvent.click(manifestFileInput);
        const fakePBMCFile = new File(["foo"], "pbmc.xlsx", {
            type: XLSX_MIMETYPE
        });
        fireEvent.change(manifestFileInput, {
            target: { files: [fakePBMCFile] }
        });

        expect(await findByTestId("validationSuccess")).toBeInTheDocument();
    };

    // Select a manifest type
    fireEvent.click(pbmcRadio);

    // Select a file to upload and wait for validations to complete
    apiCreate.mockResolvedValue({ errors: [] });
    await uploadFile();

    // Failed submission
    const errors = ["uh oh!"];
    apiCreate.mockRejectedValue({
        response: { status: 400, data: { _error: { message: { errors } } } }
    });
    fireEvent.click(submitButton);
    expect(await findByTestId("uploadErrors")).toBeInTheDocument();
    expect(queryByText(errors[0])).toBeInTheDocument();

    // Successful submission
    apiCreate.mockResolvedValue({
        metadata_json_patch: { protocol_id: "CIMAC-12345" }
    });
    await uploadFile();
    expect(queryByTestId("uploadSuccess")).not.toBeInTheDocument();
    fireEvent.click(submitButton);
    expect(await findByTestId("uploadSuccess")).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("disabled");
});
