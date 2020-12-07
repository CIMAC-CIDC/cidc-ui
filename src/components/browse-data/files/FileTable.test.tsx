import { fireEvent } from "@testing-library/react";
import { range } from "lodash";
import React from "react";
import { renderWithRouter } from "../../../../test/helpers";
import { getFiles, getFilelist } from "../../../api/api";
import { DataFile } from "../../../model/file";
import { AuthContext } from "../../identity/AuthProvider";
import FileTable, { filterParams, ObjectURL } from "./FileTable";
import history from "../../identity/History";

jest.mock("../../../api/api", () => {
    const actualApi = jest.requireActual("../../../api/api");
    return {
        __esModule: true,
        ...actualApi,
        getFiles: jest.fn(),
        getFilelist: jest.fn()
    };
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
    data: files,
    meta: { total: 123 }
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
    getFiles.mockResolvedValue(getFilesResult);
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
    getFiles.mockResolvedValue(getFilesResult);
    getFilelist.mockResolvedValue("foo");
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
    expect(getFilelist).toHaveBeenCalledWith("test-token", [0, 2, 4]);
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
