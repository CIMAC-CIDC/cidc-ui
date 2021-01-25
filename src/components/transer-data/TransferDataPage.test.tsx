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
const urls = {
    gs_url: "gs://some-gcs-url",
    console_url: "https://some-console-url"
};

const renderWithInfoContext = () =>
    renderWithUserContext(
        <InfoContext.Provider
            value={{ supportedTemplates: { assays, analyses } }}
        >
            <TransferDataPage />
        </InfoContext.Provider>
    );

it("works as expected", async () => {
    global.open = jest.fn(); // mock window.open
    apiFetch.mockResolvedValue({ _items: trials });
    apiCreate.mockImplementation(
        async (url: string, token: string, config: any) => {
            if (url === "/ingestion/intake_bucket") {
                return urls;
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

    // There should be a button linking to the console
    fireEvent.click(await findByText(/visit the data upload console/i));
    expect(global.open).toHaveBeenCalledWith(
        urls.console_url,
        "_blank",
        "noopener,noreferrer"
    );

    // gsutil command with generated URI should appear
    expect(
        getByText(
            new RegExp(
                `gsutil -m cp -r <local data directory> ${urls.gs_url}`,
                "i"
            )
        )
    ).toBeInTheDocument();

    // API should've been called correctly
    expect(apiCreate).toHaveBeenCalledWith(
        "/ingestion/intake_bucket",
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
