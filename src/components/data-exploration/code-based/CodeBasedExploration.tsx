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
import exampleUpsetPlot from "../../../img/example-colab-screenshot.upset.png";

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
                            sample-level metadata. Additionally, we are working
                            with researchers and statisticians to figure out
                            some widely-used and high-impact assay data tables
                            for direct analysis with minimal setup.
                        </Typography>
                        <Typography>
                            These datasets are most easily accessed via python
                            notebooks hosted on Google's Colaboratory, for which
                            we have a few templates and examples listed below.
                            CIDC enables data access for all approved users.
                            Please contact CIDC at&nbsp;
                            <a href="mailto:cidc@jimmy.harvard.edu">
                                cidc@jimmy.harvard.edu
                            </a>
                            &nbsp; if you have any issues accessing the data
                            tables. The same data restrictions and security
                            apply to all data accessed via this mechanism as via
                            the portal.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item>
                <Card style={{ maxWidth: 1100, width: 1100 }}>
                    <CardHeader title="Templates and Examples" />
                    <CardContent className="markdown-body">
                        <ul>
                            {[
                                {
                                    name:
                                        "Template: Upset Plot by Trial and/or Assay",
                                    destination:
                                        "https://colab.research.google.com/drive/14xys5GrZ7OzCC5eUYMrexM9Imq4szw7o",
                                    description:
                                        "a template meant for copying and modification by the user to generate their own upset plots " +
                                        "showing the number of participants with a given subset of assays across a given subset of trials"
                                },
                                {
                                    name:
                                        "Template: Upset Plot for Collection Events on a Single Trial",
                                    destination:
                                        "https://colab.research.google.com/drive/1kheXUtozN6dcxdrf_U_WtnXUiDBhEMt2",
                                    description:
                                        "a template meant for copying and modification by the user to generate their own upset plots " +
                                        "showing the number of participants with a given subset of collection events across a single trial"
                                },
                                {
                                    name:
                                        "Example: Participant and Sample Exploration",
                                    destination:
                                        "https://colab.research.google.com/drive/1VXVLpLE9_D7fW5cZP4j2jyTOA4q42sJk",
                                    description:
                                        "a demonstration of more complex code-based filtering and exploration of samples and participants"
                                }
                            ].map(item =>
                                item.destination == null ? (
                                    item.description == null ? (
                                        <li key={item.name}>
                                            <b>
                                                {item.name} (under construction)
                                            </b>
                                        </li>
                                    ) : (
                                        <li key={item.name}>
                                            <b>
                                                {item.name} (under construction)
                                            </b>{" "}
                                            - {item.description}
                                        </li>
                                    )
                                ) : item.description == null ? (
                                    <li key={item.name}>
                                        <a
                                            href={item.destination}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {item.name}
                                        </a>
                                    </li>
                                ) : (
                                    <li key={item.name}>
                                        <b>
                                            <a
                                                href={item.destination}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {item.name}
                                            </a>
                                        </b>{" "}
                                        - {item.description}
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
                                "Screenshot of Google Colaboratory interface for Upset Plot Template, showing the top of Section 3. Parameters where you can choose trials to include in the plot."
                            }
                        ></img>
                        <img
                            src={exampleUpsetPlot}
                            alt={
                                "Upset plot as generated in Google Colaboratory using the Upset Plot Template."
                            }
                        ></img>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default CodeBasedExplorationPage;
