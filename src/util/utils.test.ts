import { formatDataCategory, naivePluralize, formatFacetType } from "./utils";

test("formatDataCategory", () => {
    expect(formatDataCategory("Foo|Bar")).toBe("Foo Bar");
    expect(formatDataCategory("Foo|")).toBe("Foo");
    expect(formatDataCategory("Foo")).toBe("Foo");
    expect(formatDataCategory("")).toBe("");
});

test("naivePluralize", () => {
    const word = "word";
    const words = "words";
    expect(naivePluralize(word, 0)).toBe(words);
    expect(naivePluralize(word, 1)).toBe(word);
    expect(naivePluralize(word, 2)).toBe(words);
});

test("formatFacetType", () => {
    expect(formatFacetType("H&E".toLowerCase())).toBe("hande");
    expect(formatFacetType("ATAC-Seq".toLowerCase())).toBe("atacseq");
    expect(formatFacetType("WES Tumor-Only".toLowerCase())).toBe(
        "wes_tumor_only"
    );
});
