import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import ManifestTemplateDownload from "./ManifestTemplateDownload";
import ManifestUpload from "./ManifestUpload";
import { RouteComponentProps } from "react-router";

export const useManifestsStyles = makeStyles({
    card: {
        width: "80%",
        margin: "auto",
        marginTop: "1.5em"
    }
});

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
