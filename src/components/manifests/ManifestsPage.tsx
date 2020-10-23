import * as React from "react";
import { Grid } from "@material-ui/core";
import ManifestTemplateDownload from "./ManifestTemplateDownload";
import ManifestUpload from "./ManifestUpload";
import { useRootStyles } from "../../rootStyles";

const ManifestsPage: React.FC = () => {
    const classes = useRootStyles();

    return (
        <Grid container className={classes.centeredPage} spacing={3}>
            <Grid item>
                <ManifestTemplateDownload />
            </Grid>
            <Grid item>
                <ManifestUpload />
            </Grid>
        </Grid>
    );
};

export default ManifestsPage;
