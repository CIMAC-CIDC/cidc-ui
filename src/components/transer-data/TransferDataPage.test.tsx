import { range } from "lodash";
import React from "react";
import TransferDataPage from "./TransferDataPage";
import { apiCreate, apiFetch } from "../../api/api";
import { InfoContext } from "../info/InfoProvider";
import { renderWithUserContext } from "../../../test/helpers";
import { fireEvent, waitFor } from "@testing-library/react";
jest.mock("../../api/api");

const trials = [{ trial_id: "test-trial-0" }];
const assays = ["wes"];
const analyses = ["wes_analysis"];
const metadataFile = new File(["fake metadata xlsx"], "metadata.xlsx");
const description = "a test description of this upload";
const gcsURI = "gs://cidc-intake-test/test-trial-0/wes/testuser-123";

const renderWithInfoContext = () =>
    renderWithUserContext(
        <InfoContext.Provider
            value={{ supportedTemplates: { assays, analyses } }}
        >
            <TransferDataPage />
        </InfoContext.Provider>
    );

it("works as expected", async () => {
    apiFetch.mockResolvedValue({ _items: trials });
    apiCreate.mockImplementation(
        async (url: string, token: string, config: any) => {
            if (url === "/ingestion/intake_gcs_uri") {
                return gcsURI;
            }
        }
    );

    const {
        getByLabelText,
        getByText,
        findByText,
        queryByText
    } = renderWithInfoContext();

    expect(apiFetch).toHaveBeenCalled();

    // Select trial and assay
    fireEvent.mouseDown(getByLabelText(/protocol identifier/i));
    fireEvent.click(await findByText(/test-trial-0/i));
    fireEvent.mouseDown(getByLabelText(/upload type/i));
    fireEvent.click(await findByText(/wes_analysis/i));

    // Initiate data transfer
    fireEvent.click(getByText(/initiate data transfer/i));

    // gsutil command with generated URI should appear
    expect(
        await findByText(
            new RegExp(`gsutil -m cp -r <local data directory> ${gcsURI}`, "i")
        )
    ).toBeInTheDocument();

    // API should've been called correctly
    expect(apiCreate).toHaveBeenCalledWith(
        "/ingestion/intake_gcs_uri",
        "test-token",
        { data: { trial_id: "test-trial-0", upload_type: "wes_analysis" } }
    );

    // Template download button should appear
    const templateButton = queryByText(/wes_analysis template/i);
    expect(templateButton).toBeInTheDocument();
    expect(templateButton?.closest("button")).not.toBeNull();

    // Manifest submission form should work as expected
    fireEvent.change(getByLabelText(/metadata spreadsheet/i), {
        target: { files: [metadataFile] }
    });
    fireEvent.change(getByLabelText(/description/i), {
        target: { value: description }
    });
    fireEvent.click(getByText(/upload metadata/i));

    await waitFor(() => expect(apiCreate).toHaveBeenCalled());
});
