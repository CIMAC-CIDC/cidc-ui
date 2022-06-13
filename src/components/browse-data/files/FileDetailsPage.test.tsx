import React from "react";
import { apiFetch } from "../../../api/api";
import FileDetailsPage, { AdditionalMetadataTable } from "./FileDetailsPage";
import { renderAsRouteComponent } from "../../../../test/helpers";
import { fireEvent, act, render, cleanup } from "@testing-library/react";
import history from "../../identity/History";
import { useUserContext } from "../../identity/UserProvider";

jest.mock("../../../api/api");
jest.mock("../../../util/useRawFile");
jest.mock("../../identity/UserProvider");

beforeEach(() => {
    useUserContext.mockImplementation(() => ({ canDownload: true }));
});

const idToken = "test-token";
const downloadURL = "do-a-download";
const file = {
    id: 1,
    object_url: "some/url",
    trial_id: "test-trial-id",
    upload_type: "wes",
    file_ext: "bam",
    file_size_bytes: 100,
    uploaded_timestamp: Date.now(),
    data_category_prefix: "WES"
};

it("renders a loader at first", () => {
    const { queryByTestId } = renderAsRouteComponent(FileDetailsPage);
    expect(queryByTestId("loader")).toBeInTheDocument();
});

const renderFileDetails = () =>
    renderAsRouteComponent(FileDetailsPage, {
        path: "/browse-data/:fileId",
        route: `/browse-data/${file.id}`,
        authData: { state: "logged-in", userInfo: { idToken } }
    });

const mockFetch = (
    f: any = file,
    rf: any[] = [],
    dlUrl: string = downloadURL
) => {
    apiFetch.mockImplementation(async (url: string) => {
        if (url.includes("related_files")) {
            return { _items: rf };
        }
        if (url.includes("download_url")) {
            return dlUrl;
        }
        return f;
    });
};

it("renders details when a file is provided", async () => {
    mockFetch();

    const { findByText, queryByText } = renderFileDetails();
    expect(
        await findByText(new RegExp(file.object_url, "i"))
    ).toBeInTheDocument();

    // No "special" features rendered
    expect(queryByText(/clustergrammer/i)).not.toBeInTheDocument();
    expect(queryByText(/ihc expression plot/i)).not.toBeInTheDocument();
    expect(queryByText(/additional metadata/i)).not.toBeInTheDocument();

    expect(apiFetch).toHaveBeenCalledWith(
        `/downloadable_files/${file.id}`,
        idToken
    );
});

it("renders no file description if none is available", async () => {
    mockFetch();
    const { findByText, queryByText } = renderFileDetails();
    await findByText(file.object_url);
    expect(queryByText(/about this file/i)).not.toBeInTheDocument();
});

it("shows file descriptions when available", async () => {
    const description = "a test description";
    mockFetch({ ...file, long_description: description });
    const { findByText, queryByText } = renderFileDetails();
    expect(await findByText(/about this file/i)).toBeInTheDocument();
    expect(queryByText(new RegExp(description, "i"))).toBeInTheDocument();
});

it("generates download URLs and performs direct downloads", async done => {
    mockFetch();

    const { findByText, getByText } = renderFileDetails();

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
    expect(apiFetch).toHaveBeenCalledWith(
        `/downloadable_files/download_url?id=${file.id}`,
        idToken
    );
});

it("hides file download buttons if the user doesn't have download permissions", async () => {
    mockFetch();
    useUserContext.mockImplementation(() => ({ canDownload: false }));
    const { findByText, queryByText } = renderFileDetails();

    await findByText(file.object_url);

    expect(queryByText(/direct download/i)).not.toBeInTheDocument();
    expect(queryByText(/temporary download link/i)).not.toBeInTheDocument();
});

it("shows a clustergrammer card when file has appropriate data", async () => {
    mockFetch({ ...file, clustergrammer: {} });

    const { findByText } = renderFileDetails();
    expect(
        await findByText(/visualize with clustergrammer/i)
    ).toBeInTheDocument();
});

it("shows an IHC plot when file has appropriate data", async () => {
    mockFetch({ ...file, ihc_combined_plot: [{ foo: "bar" }] });
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
    mockFetch({ ...file, additional_metadata: additionalMetadata });
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

describe("related files", () => {
    const sectionHeader = new RegExp(
        `related ${file.data_category_prefix} files`,
        "i"
    );
    const noRelatedFilesText = /no directly related files/i;
    const downloadButtonText = /download all related files/i;
    it("handles no related files", async () => {
        mockFetch();
        const { findByText, queryByText, getByText } = renderFileDetails();
        expect(await findByText(sectionHeader)).toBeInTheDocument();

        // provides a message about no related files
        expect(queryByText(noRelatedFilesText)).toBeInTheDocument();

        // provides link to browse all files
        const browseAllFilesLink = getByText(/browse all files in this trial/i);
        expect(browseAllFilesLink.getAttribute("href")).toBe(
            `/browse-data?file_view=1&trial_ids=${file.trial_id}`
        );

        // download button is disabled
        const downloadButton = getByText(downloadButtonText).closest("button");
        expect(downloadButton?.disabled).toBe(true);
    });

    const files = [
        { id: 1, object_url: "url/1" },
        { id: 2, object_url: "url/2" },
        { id: 3, object_url: "url/3" }
    ];

    it("displays related files and makes them downloadable", async () => {
        mockFetch(file, files);

        const { findByText, queryByText, getByText } = renderFileDetails();
        expect(await findByText(sectionHeader)).toBeInTheDocument();

        // doesn't display the "no related files message"
        expect(queryByText(noRelatedFilesText)).not.toBeInTheDocument();

        // displays all files
        files.forEach(({ id, object_url }) => {
            const fileLink = getByText(object_url).closest("a");
            expect(fileLink?.href).toContain(`/browse-data/${id}`);
        });

        // makes all files batch downloadable
        const downloadButton = getByText(downloadButtonText).closest("button");
        expect(downloadButton?.disabled).toBe(false);
    });

    it("doesn't show a download button for network-viewer users", async () => {
        mockFetch();
        useUserContext.mockImplementation(() => ({ canDownload: false }));

        const { findByText, queryByText } = renderFileDetails();
        expect(await findByText(noRelatedFilesText)).toBeInTheDocument();
        expect(queryByText(downloadButtonText)).not.toBeInTheDocument();
    });
});

test("'back to file browser' button has expected href", async () => {
    mockFetch();
    const buttonText = /back to file browser/i;

    // If there's no filter state, the button links to the file browser by default
    const noState = renderFileDetails();
    const noStateButton = await noState.findByText(buttonText);
    expect(noStateButton.closest("a").href).toBe(
        "http://localhost/browse-data?file_view=1"
    );
    cleanup();

    // If there's filter state, the button includes that state in its href
    const route = "/browse-data?some=1&filter=2&params=3";
    history.push(`/browse-data/${file.id}`, { prevPath: route });
    const withState = renderAsRouteComponent(FileDetailsPage, {
        path: "/browse-data/:fileId",
        authData: { state: "logged-in", userInfo: { idToken } },
        history
    });
    const withStateButton = await withState.findByText(buttonText);
    expect(withStateButton.closest("a").href).toBe(`http://localhost${route}`);
});
