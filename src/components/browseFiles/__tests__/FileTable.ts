import { filtersToWhereClause, headerToSortClause } from "../FileTable";

test("filtersToWhereClause", () => {
    expect(filtersToWhereClause({})).toBe("");
    expect(filtersToWhereClause({ type: [1, 2] })).toBe(
        '(assay_type=="1" or assay_type=="2")'
    );
    expect(filtersToWhereClause({ type: [1, 2], protocol_id: undefined })).toBe(
        '(assay_type=="1" or assay_type=="2")'
    );
    expect(
        filtersToWhereClause({
            type: [1, 2],
            protocol_id: ["a", "b"],
            data_format: ["wes"]
        })
    ).toBe(
        '(trial=="a" or trial=="b") and (assay_type=="1" or assay_type=="2") and (data_format=="wes")'
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
