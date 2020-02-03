import { filtersToWhereClause, headerToSortClause } from "../FileTable";

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
        '(trial=="a" or trial=="b") and (upload_type=="1" or upload_type=="2") and (analysis_friendly==true)'
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
