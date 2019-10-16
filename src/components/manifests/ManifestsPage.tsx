import * as React from "react";
import { Grid } from "@material-ui/core";
import ManifestTemplateDownload from "./ManifestTemplateDownload";
import ManifestUpload from "./ManifestUpload";
import { RouteComponentProps } from "react-router";

export default (props: RouteComponentProps) => {
    return (
        <Grid container>
            <Grid item xs={12}>
                <ManifestTemplateDownload />
            </Grid>
            <Grid item xs={12}>
                <ManifestUpload />
            </Grid>
        </Grid>
    );
};
