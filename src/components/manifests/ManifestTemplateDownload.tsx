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
    Typography,
    CardHeader
} from "@material-ui/core";
import { onValueChange } from "./utils";
import { InfoContext } from "../info/InfoProvider";
import { CloudDownload } from "@material-ui/icons";
import "./Manifests.css";

// Given a template type and name, get the path to the corresponding
// xlsx file in the static/ folder.
function nameToURL(type: string, name: string) {
    const fmtedName = name.toLowerCase().replace(" ", "_");
    return `${process.env.PUBLIC_URL}/static/xlsx/${type}/${fmtedName}_template.xlsx`;
}

const ManifestTemplateDownload: React.FunctionComponent = () => {
    const info = React.useContext(InfoContext);

    const [templateType, setTemplateType] = React.useState<string | undefined>(
        undefined
    );
    const [templateName, setTemplateName] = React.useState<string | undefined>(
        undefined
    );

    const templateNames: string[] =
        templateType && info ? info.supportedTemplates[templateType] : [];
    const templateURL =
        templateType && templateName && nameToURL(templateType, templateName);

    return (
        <Card className="Manifests-card">
            <CardHeader
                avatar={<CloudDownload />}
                title={
                    <Typography variant="h6">Download a template</Typography>
                }
            />
            <CardContent>
                <form method="get" action={templateURL}>
                    <Grid
                        container
                        direction="row"
                        justify="space-evenly"
                        alignItems="center"
                    >
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="templateType">
                                    Template Type
                                </InputLabel>
                                <Select
                                    inputProps={{
                                        id: "templateType",
                                        name: "type"
                                    }}
                                    value={templateType || ""}
                                    onChange={(e: any) =>
                                        onValueChange(value => {
                                            setTemplateType(value);
                                            setTemplateName(undefined);
                                        })(e)
                                    }
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
                            <FormControl fullWidth>
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
                                    onChange={(e: any) =>
                                        onValueChange(setTemplateName)(e)
                                    }
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
                        <Grid item xs={2}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!templateName}
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

export default ManifestTemplateDownload;
