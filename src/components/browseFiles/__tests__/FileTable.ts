import {
    triggerBatchDownload,
    filterParamsFromFilters,
    sortParamsFromHeader
} from "../FileTable";
import { getDownloadURL } from "../../../api/api";
jest.mock("../../../api/api");

test("filterParamsFromFilters", () => {
    expect(filterParamsFromFilters({})).toEqual({
        analysis_friendly: true,
        trial_ids: undefined,
        upload_types: undefined
    });
    expect(filterParamsFromFilters({ raw_files: true })).toEqual({
        analysis_friendly: false,
        trial_ids: undefined,
        upload_types: undefined
    });
    expect(
        filterParamsFromFilters({ upload_type: [1, 2], raw_files: true })
    ).toEqual({
        analysis_friendly: false,
        trial_ids: undefined,
        upload_types: "1,2"
    });
    expect(
        filterParamsFromFilters({
            upload_type: [1, 2],
            trial_id: ["a", "b"]
        })
    ).toEqual({
        analysis_friendly: true,
        trial_ids: "a,b",
        upload_types: "1,2"
    });
});

test("sortParamsFromHeader", () => {
    expect(sortParamsFromHeader({ key: "foo", direction: "asc" })).toEqual({
        sort_field: "foo",
        sort_direction: "asc"
    });
    expect(sortParamsFromHeader({ key: "foo", direction: "desc" })).toEqual({
        sort_field: "foo",
        sort_direction: "desc"
    });
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
                ["/a", "_blank"],
                ["/b", "_blank"],
                ["/c", "_blank"]
            ])
        );
        done();
    });
});
