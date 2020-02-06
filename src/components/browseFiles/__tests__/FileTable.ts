import {
    filtersToWhereClause,
    headerToSortClause,
    triggerBatchDownload
} from "../FileTable";
import { getDownloadURL } from "../../../api/api";
jest.mock("../../../api/api");

test("filtersToWhereClause", () => {
    expect(filtersToWhereClause({})).toBe("(analysis_friendly==true)");
    expect(filtersToWhereClause({ raw_files: true })).toBe("");
    expect(filtersToWhereClause({ upload_type: [1, 2], raw_files: true })).toBe(
        '(upload_type=="1" or upload_type=="2")'
    );
    expect(
        filtersToWhereClause({
            upload_type: [1, 2],
            trial_id: undefined,
            raw_files: true
        })
    ).toBe('(upload_type=="1" or upload_type=="2")');
    expect(
        filtersToWhereClause({
            upload_type: [1, 2],
            trial_id: ["a", "b"]
        })
    ).toBe(
        '(trial_id=="a" or trial_id=="b") and (upload_type=="1" or upload_type=="2") and (analysis_friendly==true)'
    );
});

test("headerToSortClause", () => {
    expect(headerToSortClause({ key: "foo", direction: "asc" })).toBe(
        '[("foo", 1)]'
    );
    expect(headerToSortClause({ key: "foo", direction: "desc" })).toBe(
        '[("foo", -1)]'
    );
});

test("triggerBatchDownload", async done => {
    const testToken = "test-token";
    const ids = [0, 1, 2];
    const urls = ["/a", "/b", "/c"];
    getDownloadURL.mockImplementation((token: string, fileId: number) => {
        expect(token).toBe(testToken);
        return Promise.resolve(urls[fileId]);
    });

    window.open = jest.fn();

    // @ts-ignore
    await triggerBatchDownload(testToken, ids, () => {
        expect(getDownloadURL).toBeCalledTimes(3);
        expect(window.open).toHaveBeenCalledTimes(3);
        expect(new Set(window.open.mock.calls)).toEqual(
            new Set([
                ["/a", "_parent"],
                ["/b", "_parent"],
                ["/c", "_parent"]
            ])
        );
        done();
    });
});
