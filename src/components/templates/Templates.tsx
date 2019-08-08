import * as React from "react";
import {
    FormControl,
    MenuItem,
    InputLabel,
    Button,
    Select,
    Grid,
    Card,
    CardContent,
    Typography
} from "@material-ui/core";

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

    const formControlStyle = { width: "100%" };

    return (
        <Card style={{ width: "80%", margin: "auto" }}>
            <CardContent>
                <Typography variant="body1">Download a template</Typography>
                <form
                    style={{ width: "100%", marginTop: 10 }}
                    method="get"
                    action={templateURL}
                >
                    <Grid
                        container
                        direction="row"
                        justify="space-evenly"
                        alignItems="center"
                    >
                        <Grid item xs={3}>
                            <FormControl style={formControlStyle}>
                                <InputLabel htmlFor="templateType">
                                    Template Type
                                </InputLabel>
                                <Select
                                    inputProps={{
                                        id: "templateType",
                                        name: "type"
                                    }}
                                    value={templateType || ""}
                                    onChange={onValueChange(setTemplateType)}
                                >
                                    <MenuItem value="manifests">
                                        Shipping/Receiving Manifest
                                    </MenuItem>
                                    <MenuItem value="metadata">
                                        Assay Metadata
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl style={formControlStyle}>
                                <InputLabel htmlFor="templateName">
                                    Template
                                </InputLabel>
                                <Select
                                    id="templateName"
                                    inputProps={{
                                        id: "templateName",
                                        name: "name"
                                    }}
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
                            </FormControl>
                        </Grid>
                        <Grid item xs={1}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!templateURL}
                            >
                                Download
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};

export default Templates;
