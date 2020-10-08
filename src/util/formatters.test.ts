import { formatDataCategory } from "./formatters";

test("formatDataCategory", () => {
    expect(formatDataCategory("Foo|Bar")).toBe("Foo Bar");
    expect(formatDataCategory("Foo|")).toBe("Foo");
    expect(formatDataCategory("Foo")).toBe("Foo");
    expect(formatDataCategory("")).toBe("");
});
