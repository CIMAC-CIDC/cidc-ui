import * as React from "react";
import { Grid } from "@material-ui/core";
import ManifestTemplateDownload from "./ManifestTemplateDownload";
import ManifestUpload from "./ManifestUpload";
import { RouteComponentProps } from "react-router";
import { useRootStyles } from "../../rootStyles";

export default (props: RouteComponentProps) => {
    const classes = useRootStyles();

    const manifestCardStyle = { width: "80%", margin: "auto" };

    return (
        <Grid container className={classes.centeredPage} spacing={3}>
            <Grid item style={manifestCardStyle}>
                <ManifestTemplateDownload />
            </Grid>
            <Grid item style={manifestCardStyle}>
                <ManifestUpload />
            </Grid>
        </Grid>
    );
};
