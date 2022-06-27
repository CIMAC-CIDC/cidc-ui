import * as React from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography
} from "@material-ui/core";
import { useRootStyles } from "../../../rootStyles";

const InteractiveExplorationPage: React.FC<{
    viewToggleButton: React.ReactElement;
}> = props => {
    const classes = useRootStyles();

    return (
        <Grid
            container
            direction="column"
            spacing={1}
            className={classes.centeredPage}
            alignItems="center"
        >
            <Grid
                item
                style={{
                    maxWidth: 1100,
                    width: "inherit"
                }}
            >
                <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    spacing={1}
                >
                    <Grid item>
                        <Box margin={1}>
                            <Typography color="textSecondary" variant="caption">
                                Interactive view based on filtering with
                                on-screen controls
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item>{props.viewToggleButton}</Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: "inherit" }}>
                    <CardHeader title="Interactive View Overview" />
                    <CardContent className="markdown-body">
                        <Typography>
                            Using Google DataStudio we have created a few
                            interactive dashboards to explore CIMAC-CIDC trial
                            participant- and sample-level metadata.
                        </Typography>
                        <Typography>
                            <ol>
                                {[
                                    {
                                        name:
                                            "Sample Collection Event Dashboard",
                                        description: `Use this dashboard to explore data
                                            available at particular timepoints.
                                            In order to facilitate searches across trials,
                                            timepoints are categorized as baseline (before
                                            trial therapy initiation) or post (after trial
                                            therapy initiation).`
                                    },
                                    {
                                        name: "Assays Dashboard",
                                        description: `Use this dashboard to explore the number
                                            of samples available for each assay.
                                            This dashboard also provides the ability to search
                                            for participants who have a particular number of
                                            samples within an assay type.
                                            For example, patients who have 4 Olink samples which
                                            *may* indicate samples collected at 4 separate
                                            timepoints or the availability of replicates.`
                                    },
                                    {
                                        name: "Sample Dashboard",
                                        description: `Use this dashboard to explore other specific
                                            sample details such as fixation type.`
                                    }
                                ].map(item => (
                                    <li>
                                        <b>{item.name}</b> - {item.description}
                                    </li>
                                ))}
                            </ol>
                        </Typography>
                        <Typography>
                            All three boards allow a user to limit the
                            exploration to particular trials or cohorts.
                        </Typography>

                        <iframe
                            title="embedded-datastudio"
                            height="475"
                            width="100%"
                            src="https://datastudio.google.com/embed/reporting/6865f6eb-f7f8-4f7f-87b2-f591403dd813/page/p_7gryw0ykuc"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: 1100 }}>
                    <CardHeader title="Direct Links" />
                    <CardContent className="markdown-body">
                        <Typography>
                            <ul>
                                {[
                                    {
                                        name:
                                            "Sample Collection Event Dashboard",
                                        destination:
                                            "https://datastudio.google.com/reporting/6865f6eb-f7f8-4f7f-87b2-f591403dd813/page/RQ4qC"
                                    },
                                    {
                                        name: "Assays Dashboard",
                                        destination:
                                            "https://datastudio.google.com/reporting/6865f6eb-f7f8-4f7f-87b2-f591403dd813/page/p_4edtmds7tc"
                                    },
                                    {
                                        name: "Sample Dashboard",
                                        destination:
                                            "https://datastudio.google.com/reporting/6865f6eb-f7f8-4f7f-87b2-f591403dd813/page/p_4sllxheeuc"
                                    }
                                ].map(item => (
                                    <li>
                                        <a href={item.destination}>
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default InteractiveExplorationPage;
