import React from "react";
import { Grid, Typography, Button, Divider } from "@material-ui/core";
import Clustergrammer from "../visualizations/Clustergrammer";
import { DataFile } from "../../model/file";
import { RouteComponentProps } from "react-router";

const CLUSTERGRAMMER_HELP_LINK =
    "https://clustergrammer.readthedocs.io/interacting_with_viz.html";

export interface IClustergrammerPageProps extends RouteComponentProps {
    file: DataFile;
}

const ClustergrammerPage: React.FC<IClustergrammerPageProps> = ({
    file,
    history
}) => {
    const width = 1500;
    const height = 900;

    const backButton = (
        <Button
            onClick={() => history.push(`/file-details/${file.id}`)}
            variant="contained"
        >
            Back to File Details
        </Button>
    );

    return (
        <Grid
            container
            spacing={3}
            style={{ width, margin: "auto" }}
            direction="column"
        >
            {file.clustergrammer ? (
                <>
                    <Grid item>
                        <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                <Typography
                                    variant="overline"
                                    style={{ fontSize: "1.1rem" }}
                                >
                                    Clustergrammer Heatmap for{" "}
                                    <strong>{file.object_url}</strong>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    href={CLUSTERGRAMMER_HELP_LINK}
                                    variant="contained"
                                    target="_blank"
                                >
                                    Clustergrammer Help
                                </Button>
                            </Grid>
                            <Grid item>{backButton}</Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Divider />
                    </Grid>
                    <Grid item>
                        <Clustergrammer
                            networkData={file.clustergrammer}
                            width={width}
                            height={height}
                        />
                    </Grid>
                </>
            ) : (
                <>
                    <Grid item>
                        The file <strong>{file.object_url}</strong> cannot be
                        visualized with Clustergrammer.
                    </Grid>
                    <Grid item>{backButton}</Grid>
                </>
            )}
        </Grid>
    );
};

export default ClustergrammerPage;
