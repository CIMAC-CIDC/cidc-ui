import { fireEvent } from "@testing-library/react";
import { range } from "lodash";
import React from "react";
import { renderWithRouter } from "../../../../test/helpers";
import { apiCreate, apiFetch } from "../../../api/api";
import { DataFile } from "../../../model/file";
import { AuthContext } from "../../identity/AuthProvider";
import FileTable, { filterParams, ObjectURL } from "./FileTable";
import history from "../../identity/History";
import { useUserContext } from "../../identity/UserProvider";

jest.mock("../../../api/api");
jest.mock("../../identity/UserProvider");

beforeEach(() => {
    useUserContext.mockImplementation(() => ({ canDownload: true }));
});

test("filterParams", () => {
    expect(filterParams({})).toEqual({});
    const exampleFilters = {
        trial_ids: ["a", "b"],
        facets: ["foo|a|1", "foo|a|2", "bar|1", "bar|2"]
    };
    expect(filterParams(exampleFilters)).toEqual({
        trial_ids: "a,b",
        facets: "foo|a|1,foo|a|2,bar|1,bar|2"
    });
});

const files: DataFile[] = range(0, 5).map(id => ({
    id,
    object_url: `file/url/${id}`,
    trial_id: "test-trial",
    file_ext: "csv",
    file_size_bytes: 1,
    data_category: "participants info",
    uploaded_timestamp: new Date(Date.now())
}));
const getFilesResult = {
    _items: files,
    _meta: { total: 123 }
};
const toggleButtonText = "toggle file view";
const renderFileTable = () => {
    return renderWithRouter(
        <AuthContext.Provider
            value={{ state: "logged-in", userInfo: { idToken: "test-token" } }}
        >
            <FileTable
                history={history}
                viewToggleButton={<button>{toggleButtonText}</button>}
            />
        </AuthContext.Provider>
    );
};

it("renders with no filters applied", async () => {
    apiFetch.mockResolvedValue(getFilesResult);
    const {
        findAllByText,
        queryByText,
        queryAllByTestId,
        queryAllByText
    } = renderFileTable();
    expect(queryAllByTestId(/placeholder-row/i).length).toBeGreaterThan(0);

    expect((await findAllByText(/file\//i)).length).toBe(files.length);
    expect(queryAllByText(/url/i).length).toBe(files.length);
    expect(queryAllByText(/participants info/i).length).toBe(files.length);
    expect(queryAllByText(/csv/i).length).toBe(files.length);
    expect(queryByText(/toggle file view/i)).toBeInTheDocument();
    // loading indicator gone
    expect(queryByText(/loading/i)).not.toBeInTheDocument();
});

it("handles batch download requests", async () => {
    apiFetch.mockResolvedValue(getFilesResult);
    apiCreate.mockResolvedValue("foo");
    const { findAllByText, getByText, queryByText } = renderFileTable();
    const rows = await findAllByText(/url/i);

    expect(getByText(/select files for batch download/i)).toBeInTheDocument();

    // select rows
    fireEvent.click(rows[0]);
    expect(queryByText(/download 1 file/i)).toBeInTheDocument();
    fireEvent.click(rows[2]);
    fireEvent.click(rows[4]);

    // open batch download dialog
    fireEvent.click(getByText(/download 3 files/i));

    // download the filelist
    fireEvent.click(getByText(/download filelist.tsv/i));
    expect(apiCreate).toHaveBeenCalledWith(
        "/downloadable_files/filelist",
        "test-token",
        { data: { file_ids: [0, 2, 4] } }
    );
});

it("doesn't display batch download buttons for users without download perms", async () => {
    apiFetch.mockResolvedValue(getFilesResult);
    useUserContext.mockImplementation(() => ({ canDownload: false }));
    const { getByText, queryByText, findAllByText } = renderFileTable();

    await findAllByText(/url/i);

    expect(getByText(/browse available files/i)).toBeInTheDocument();
    expect(queryByText(/no files selected/i)).not.toBeInTheDocument();
});

test("ObjectURL provides filter state to file details page links", async () => {
    const route = "/browse-files?some=1&filter=2&params=3";
    history.push(route);
    const { getByText } = renderWithRouter(<ObjectURL file={files[0]} />, {
        history
    });
    fireEvent.click(getByText(/url/i));
    expect(history.location.state.prevPath).toBe(route);
});
