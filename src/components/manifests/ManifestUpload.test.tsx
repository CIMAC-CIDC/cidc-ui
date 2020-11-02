import * as React from "react";
import { render, fireEvent, RenderResult } from "@testing-library/react";
import ManifestUpload from "./ManifestUpload";
import { XLSX_MIMETYPE } from "../../util/constants";
import { getManifestValidationErrors, uploadManifest } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";
import { InfoContext } from "../info/InfoProvider";
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

/**
 * Fire a selection event on a material UI Select component.
 * @param select the HTML select element under test
 * @param value the value to simulate selecting
 */
async function selectValueMUI(
    renderResult: RenderResult,
    select: Element,
    value: string
) {
    const { getAllByRole, findByText } = renderResult;
    const selectButton = getAllByRole("button", { container: select })[0];
    fireEvent.click(selectButton);
    const valueButton = await findByText(value);
    fireEvent.click(valueButton);
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
    const submitButton = getByTestId("submit-button");

    function expectNoValidationsDisplayed() {
        expect(queryByTestId("unset")).toBeInTheDocument();
        expect(queryByTestId("validationSuccess")).not.toBeInTheDocument();
        expect(queryByTestId("validationErrors")).not.toBeInTheDocument();
    }

    // Defaults on first render to no validations, disabled submit
    expectNoValidationsDisplayed();
    expect(submitButton).toHaveAttribute("disabled");

    // Select a manifest type. Material UI components make this
    // difficult: we need to first click on the select component,
    // then click on the dropdown option that subsequently appears.
    fireEvent.click(pbmcRadio);
    expectNoValidationsDisplayed();
    expect(submitButton).toHaveAttribute("disabled");

    async function doValidationRequest(errors: string[], element: string) {
        getManifestValidationErrors.mockResolvedValue(errors);

        fireEvent.click(manifestFileInput);

        const fakePBMCFile = new File(["foo"], "pbmc.xlsx", {
            type: XLSX_MIMETYPE
        });
        fireEvent.change(manifestFileInput, {
            target: { files: [fakePBMCFile] }
        });

        expect(submitButton).toHaveAttribute("disabled");

        await findByTestId(element);
        expect(queryByTestId("unset")).not.toBeInTheDocument();
    }

    // Check that validation errors show up and submit button is still disabled
    const errs = ["a", "b", "c"];
    await doValidationRequest(errs, "validationErrors");
    errs.map(e => expect(getByText(e)).toBeInTheDocument());
    expect(queryByTestId("validationSuccess")).not.toBeInTheDocument();
    expect(submitButton).toHaveAttribute("disabled");

    // Check that valid message shows up and submit button is enabled
    await doValidationRequest([], "validationSuccess");
    expect(queryByTestId("validationSuccess")).toBeInTheDocument();
    expect(queryByTestId("validationErrors")).not.toBeInTheDocument();
    expect(submitButton).not.toHaveAttribute("disabled");
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
    getManifestValidationErrors.mockResolvedValue([]);
    await uploadFile();

    // Failed submission
    const errorMessage = "uh oh!";
    uploadManifest.mockImplementation(async () => {
        throw errorMessage;
    });
    fireEvent.click(submitButton);
    expect(await findByTestId("uploadErrors")).toBeInTheDocument();
    expect(queryByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();

    // Successful submission
    await uploadFile();
    uploadManifest.mockResolvedValue({
        metadata_json_patch: { protocol_id: "CIMAC-12345" }
    });
    expect(queryByTestId("uploadSuccess")).not.toBeInTheDocument();
    fireEvent.click(submitButton);
    expect(await findByTestId("uploadSuccess")).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("disabled");
});
