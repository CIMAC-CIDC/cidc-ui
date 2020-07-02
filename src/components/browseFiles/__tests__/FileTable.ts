import { triggerBatchDownload, filterParams, sortParams } from "../FileTable";
import { getDownloadURL } from "../../../api/api";
jest.mock("../../../api/api");

test("filterParams", () => {
    expect(filterParams({})).toEqual({});
    const exampleFilters = {
        trial_ids: ["a", "b"],
        sample_types: undefined,
        assay_types: { foo: ["a", "b"], bar: ["1", "2"] },
        clinical_types: undefined
    };
    expect(filterParams(exampleFilters)).toEqual({
        trial_ids: JSON.stringify(exampleFilters.trial_ids),
        assay_types: JSON.stringify(exampleFilters.assay_types)
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
