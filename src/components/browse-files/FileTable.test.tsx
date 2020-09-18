import { fireEvent } from "@testing-library/react";
import { range } from "lodash";
import React from "react";
import { renderWithRouter } from "../../../test/helpers";
import { getFiles, getFilelist } from "../../api/api";
import { DataFile } from "../../model/file";
import { AuthContext } from "../identity/AuthProvider";
import FileTable, { filterParams, sortParams } from "./FileTable";
jest.mock("../../api/api");

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

test("sortParams", () => {
    expect(sortParams({ key: "foo", direction: "asc" })).toEqual({
        sort_field: "foo",
        sort_direction: "asc"
    });
    expect(sortParams({ key: "foo", direction: "desc" })).toEqual({
        sort_field: "foo",
        sort_direction: "desc"
    });
});

const files: Array<Partial<DataFile>> = range(0, 5).map(id => ({
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
const renderFileTable = () => {
    return renderWithRouter(
        <AuthContext.Provider value={{ idToken: "test-token" }}>
            <FileTable history={history} />
        </AuthContext.Provider>
    );
};

it("renders with no filters applied", async () => {
    getFiles.mockResolvedValue(getFilesResult);
    const { findAllByText, queryByText, queryAllByText } = renderFileTable();
    expect(queryByText(/loading/i)).toBeInTheDocument();
    expect((await findAllByText(/file\/url/i)).length).toBe(files.length);
    expect(queryAllByText(/participants info/i).length).toBe(files.length);
    expect(queryAllByText(/csv/i).length).toBe(files.length);
    // loading indicator gone
    expect(queryByText(/loading/i)).not.toBeInTheDocument();
});

it("handles batch download requests", async () => {
    getFiles.mockResolvedValue(getFilesResult);
    getFilelist.mockResolvedValue("foo");
    const { findAllByText, getByText, queryByText } = renderFileTable();
    const rows = await findAllByText(/file\/url/i);

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
