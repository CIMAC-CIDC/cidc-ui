// Is there a smarter way to go about this than hardcoding?
// Can we list the contents of the static folder?
export const allNames = {
    manifests: ["PBMC", "Plasma", "Analyte", "HnE", "Whole Blood"],
    metadata: ["CyTOF", "MIF", "MICSSS", "Olink", "RNA Expression", "WES"]
};

export function onValueChange(setState: (v: string | undefined) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) =>
        setState(e.target.value);
}
