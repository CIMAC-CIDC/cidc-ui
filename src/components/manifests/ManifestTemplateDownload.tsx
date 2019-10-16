import * as React from "react";
import {
    FormControl,
    MenuItem,
    InputLabel,
    Select,
    Grid,
    Card,
    CardContent,
    Typography,
    CardHeader,
    GridList,
    GridListTile
} from "@material-ui/core";
import { onValueChange } from "./utils";
import { InfoContext } from "../info/InfoProvider";
import { CloudDownload } from "@material-ui/icons";
import "./Manifests.css";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import Loader from "../generic/Loader";

const ManifestTemplateDownload: React.FunctionComponent = () => {
    const info = React.useContext(InfoContext);

    const manifests = info && info.supportedTemplates.manifests;

    return (
        <Card className="Manifests-card">
            <CardHeader
                avatar={<CloudDownload />}
                title={
                    <Typography variant="h6">
                        Download an empty manifest template
                    </Typography>
                }
            />
            <CardContent>
                {!manifests ? (
                    <Loader />
                ) : (
                    <Grid container spacing={1}>
                        {manifests.map(name => (
                            <Grid item>
                                <TemplateDownloadButton
                                    fullWidth
                                    templateName={name}
                                    templateType="manifests"
                                    variant="contained"
                                >
                                    {name}
                                </TemplateDownloadButton>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default ManifestTemplateDownload;
