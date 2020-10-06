import React from "react";
import { getSingleFile, getDownloadURL } from "../../../api/api";
import FileDetailsPage, { AdditionalMetadataTable } from "./FileDetailsPage";
import { renderAsRouteComponent } from "../../../../test/helpers";
import { fireEvent, act, render, cleanup } from "@testing-library/react";
import history from "../../identity/History";
jest.mock("../../../api/api");
jest.mock("../../../util/useRawFile");

const idToken = "test-token";
const downloadURL = "do-a-download";
const file = {
    id: 1,
    object_url: "some/url",
    trial_id: "test-trial-id",
    upload_type: "wes",
    file_ext: "bam",
    file_size_bytes: 100,
    uploaded_timestamp: Date.now()
};

it("renders a loader at first", () => {
    const { queryByTestId } = renderAsRouteComponent(FileDetailsPage);
    expect(queryByTestId("loader")).toBeInTheDocument();
});

const renderFileDetails = () =>
    renderAsRouteComponent(FileDetailsPage, {
        path: "/browse-data/:fileId",
        route: `/browse-data/${file.id}`,
        authData: { idToken }
    });

it("renders details when a file is provided", async () => {
    getSingleFile.mockImplementation(async (token: string, fileId: number) => {
        expect(token).toBe(idToken);
        expect(fileId).toBe(file.id);
        return file;
    });

    const { findByText, queryByText } = renderFileDetails();
    expect(
        await findByText(new RegExp(file.object_url, "i"))
    ).toBeInTheDocument();

    // No "special" features rendered
    expect(queryByText(/clustergrammer/i)).not.toBeInTheDocument();
    expect(queryByText(/ihc expression plot/i)).not.toBeInTheDocument();
    expect(queryByText(/additional metadata/i)).not.toBeInTheDocument();
});

it("shows file descriptions when available and a message if not", async () => {
    const description = "a test description";
    getSingleFile.mockResolvedValueOnce(file).mockResolvedValueOnce({
        ...file,
        long_description: description
    });

    const noDescription = renderFileDetails();
    expect(
        await noDescription.findByText(/about this file/i)
    ).toBeInTheDocument();
    expect(
        noDescription.queryByText(/no description available/i)
    ).toBeInTheDocument();
    cleanup();

    const hasDescription = renderFileDetails();
    expect(
        await hasDescription.findByText(/about this file/i)
    ).toBeInTheDocument();
    expect(
        hasDescription.queryByText(new RegExp(description, "i"))
    ).toBeInTheDocument();
    expect(
        hasDescription.queryByText(/no description available/i)
    ).not.toBeInTheDocument();
});

it("generates download URLs and performs direct downloads", async done => {
    getSingleFile.mockResolvedValue(file);
    getDownloadURL.mockImplementation(async (token: string, fileId: number) => {
        expect(token).toBe(idToken);
        expect(fileId).toBe(file.id);
        return downloadURL;
    });

    const { findByText, getByText, queryByText } = renderFileDetails();

    // Wait for page to load
    await findByText(file.object_url);

    // Generate a download URL
    act(() => {
        fireEvent.click(getByText(/temporary download link/i));
    });
    expect(await findByText(new RegExp(downloadURL, "i"))).toBeInTheDocument();

    // mock window.location.assign
    const location = window.location;
    delete global.window.location;
    global.window.location = Object.assign(
        {},
        {
            ...location,
            assign: jest.fn((url: string) => {
                expect(url).toBe(downloadURL);
                done();
            })
        }
    );

    // Perform direct download
    act(() => {
        fireEvent.click(getByText(/direct download/i));
    });
    expect(getDownloadURL.mock.calls.length).toBe(2);
});

it("shows a clustergrammer card when file has appropriate data", async () => {
    getSingleFile.mockResolvedValue({
        ...file,
        clustergrammer: {}
    });

    const { findByText } = renderFileDetails();
    expect(
        await findByText(/visualize with clustergrammer/i)
    ).toBeInTheDocument();
});

it("shows an IHC plot when file has appropriate data", async () => {
    getSingleFile.mockResolvedValue({
        ...file,
        ihc_combined_plot: [{ foo: "bar" }]
    });
    const { findByText, queryAllByText } = renderFileDetails();
    await findByText(new RegExp(file.object_url, "i"));
    expect(
        queryAllByText(/ihc expression distribution/i).length
    ).toBeGreaterThan(0);
});

it("shows additional metadata when a file has some", async () => {
    const additionalMetadata = {
        someProperty: "some value"
    };
    getSingleFile.mockResolvedValue({
        ...file,
        additional_metadata: additionalMetadata
    });
    const { findByText, queryByText } = renderFileDetails();
    await findByText(new RegExp(file.object_url));
    expect(queryByText(/someProperty/i)).toBeInTheDocument();
    expect(queryByText(/some value/i)).toBeInTheDocument();
});

test("AdditionalMetadataTable renders metadata with expected formatting", () => {
    const { queryByText } = render(
        <AdditionalMetadataTable
            file={{
                additional_metadata: {
                    "assays.wes.assay_creator": "DFCI",
                    protocol_identifier: "10021",
                    // array for the sake of the test (unrealistic)
                    "wes.records.quality_flag": [1, 2, 3, 4]
                }
            }}
        />
    );

    // "assays" prefix removed from property names
    expect(queryByText(/assays\.wes\.assay_creator/i)).not.toBeInTheDocument();
    expect(queryByText(/wes\.assay_creator/i)).toBeInTheDocument();

    // arrays concatenated into a string
    expect(queryByText(/1, 2, 3, 4/i)).toBeInTheDocument();
});
