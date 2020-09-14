import { filterParams, sortParams } from "./FileTable";
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
