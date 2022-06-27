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
import exampleScreenShot from "../../../img/example-colab-screenshot.png";

const CodeBasedExplorationPage: React.FC<{
    history: any;
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
                                More in-depth, code-based exploration using
                                Colaboratory
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item>{props.viewToggleButton}</Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: "inherit" }}>
                    <CardHeader title="Overview" />
                    <CardContent className="markdown-body">
                        <Typography>
                            Some data from CIDC is available for direct querying
                            and exploration via Google's BigQuery database
                            system. We provide tables of participant- and
                            sample-level metadata, including some clinical data.
                            Additionally, we are working with researchers and
                            statisticians to support some widely-used and
                            high-impact assay data tables for direct analysis
                            with minimal setup.
                        </Typography>
                        <Typography>
                            These datasets are most easily accessed via python
                            notebooks hosted on Google's Colaboratory, for which
                            we have several examples listed below. CIDC will
                            allow data access for all approved users. Please
                            contact CIDC at{" "}
                            <a href="mailto:cidc@jimmy.harvard.edu">
                                cidc@jimmy.harvard.edu
                            </a>{" "}
                            for access to the data tables. The same data
                            restrictions and security apply to all data accessed
                            via this mechanism as via the portal.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: 1100 }}>
                    <CardHeader title="Examples" />
                    <CardContent className="markdown-body">
                        <ul>
                            {[
                                {
                                    name: "Introductory Tutorial",
                                    destination: null
                                },
                                {
                                    name: "Participant and sample exploration",
                                    destination:
                                        "https://colab.research.google.com/drive/1VXVLpLE9_D7fW5cZP4j2jyTOA4q42sJk#scrollTo=R_PNmBI99t4G"
                                },
                                {
                                    name:
                                        "Analysis of WES variants for 10021 from filtered .maf files",
                                    destination:
                                        "https://colab.research.google.com/drive/11BfQsD5QgShJCGWjpnhhq6OPtUVwiPgN"
                                },
                                {
                                    name:
                                        "Analysis of RNAseq with sample metadata for 10021 from quant.sf",
                                    destination:
                                        "https://colab.research.google.com/drive/1mdm4ONM0BwoBCbyGk0N2DVFEDN8Ob9Iw"
                                }
                            ].map(item =>
                                item.destination == null ? (
                                    <li key={item.name}>
                                        {item.name} (under construction)
                                    </li>
                                ) : (
                                    <li key={item.name}>
                                        <a href={item.destination}>
                                            {item.name}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: "inherit" }}>
                    <CardHeader title="Example Screenshot" />
                    <CardContent className="markdown-body">
                        <img
                            src={exampleScreenShot}
                            alt={
                                "Screenshot of a Kaplan-Meier curve for trial 10021. One subplot per cohort, one line per trial arm."
                            }
                        ></img>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default CodeBasedExplorationPage;
