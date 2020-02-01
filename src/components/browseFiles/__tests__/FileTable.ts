import { filtersToWhereClause, headerToSortClause } from "../FileTable";

test("filtersToWhereClause", () => {
    expect(filtersToWhereClause({})).toBe("");
    expect(filtersToWhereClause({ upload_type: [1, 2] })).toBe(
        '(upload_type=="1" or upload_type=="2")'
    );
    expect(
        filtersToWhereClause({ upload_type: [1, 2], trial_id: undefined })
    ).toBe('(upload_type=="1" or upload_type=="2")');
    expect(
        filtersToWhereClause({
            upload_type: [1, 2],
            trial_id: ["a", "b"]
        })
    ).toBe(
        '(trial=="a" or trial=="b") and (upload_type=="1" or upload_type=="2")'
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
