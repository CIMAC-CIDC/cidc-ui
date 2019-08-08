import * as React from "react";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";

// Is there a smarter way to go about this than hardcoding?
// Can we list the contents of the static folder?
const allNames = {
    manifests: ["PBMC", "Plasma", "Analyte", "HnE", "Whole Blood"],
    metadata: ["CyTOF", "MIF", "MICSSS", "Olink", "RNA Expression", "WES"]
};

// Given a template type and name, get the path to the corresponding
// xlsx file in the static/ folder.
function nameToURL(type: string, name: string) {
    const fmtedName = name.toLowerCase().replace(" ", "_");
    return `${
        process.env.PUBLIC_URL
    }/static/xlsx/${type}/${fmtedName}_template.xlsx`;
}

const Templates: React.FunctionComponent<{}> = props => {
    function onValueChange(setState: (v: string | undefined) => void) {
        return (e: React.ChangeEvent<HTMLSelectElement>) =>
            setState(e.target.value);
    }

    const [templateType, setTemplateType] = React.useState<string | undefined>(
        undefined
    );
    const [templateName, setTemplateName] = React.useState<string | undefined>(
        undefined
    );

    const templateNames: string[] = templateType ? allNames[templateType] : [];
    const templateURL =
        templateType && templateName && nameToURL(templateType, templateName);

    return (
        <div>
            <form method="get" action={templateURL}>
                <InputLabel htmlFor="templateType">
                    Select Template Type
                </InputLabel>
                <Select
                    id="templateType"
                    value={templateType || ""}
                    onChange={onValueChange(setTemplateType)}
                >
                    <MenuItem value="manifests">
                        Shipping/Receiving Manifest
                    </MenuItem>
                    <MenuItem value="metadata">Assay Metadata</MenuItem>
                </Select>
                <InputLabel htmlFor="templateName">Select Template</InputLabel>
                <Select
                    id="templateName"
                    value={templateName || ""}
                    onChange={onValueChange(setTemplateName)}
                    disabled={!templateNames.length}
                >
                    {templateNames.map(name => (
                        <MenuItem key={name} value={name}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
                <Button type="submit" disabled={!templateURL}>
                    Download
                </Button>
            </form>
        </div>
    );
};

export default Templates;
