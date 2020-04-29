import * as React from "react";
import {
    List,
    Grid,
    ListItem,
    ListItemText,
    Divider,
    ListSubheader
} from "@material-ui/core";
import { RouteComponentProps, Route, withRouter, Redirect } from "react-router";
import AnalysesInstructions from "./AnalysesInstructions";
import { useRootStyles } from "../../rootStyles";

const paths = {
    cli: "cli-instructions",
    wes: "wes",
    rna: "rna",
    cytof: "cytof"
};

const pathTitleMap = {
    [paths.cli]: "The CIDC Command-Line Interface",
    [paths.wes]: "WES upload",
    [paths.rna]: "RNA Expression upload",
    [paths.cytof]: "CyTOF upload"
};

const AnalysesPage: React.FunctionComponent<RouteComponentProps> = props => {
    const classes = useRootStyles();

    const AnalysisListItem: React.FunctionComponent<{
        title: string;
        path: string;
    }> = localProps => (
        <ListItem
            button
            selected={props.location.pathname.endsWith(localProps.path)}
            onClick={() => props.history.push(localProps.path)}
        >
            <ListItemText>{localProps.title}</ListItemText>
        </ListItem>
    );

    const menuWidth = 200;

    return (
        <div className={classes.centeredPage}>
            <Grid container direction="row">
                <Grid item style={{ width: menuWidth }}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            General Overview
                        </ListSubheader>
                        <AnalysisListItem
                            title="CLI Instructions"
                            path={`/${paths.cli}`}
                        />
                        <ListSubheader disableSticky>
                            Analysis-Specific Docs
                        </ListSubheader>
                        <AnalysisListItem
                            title="WES"
                            path={`/analyses/${paths.wes}`}
                        />
                        <AnalysisListItem
                            title="CyTOF"
                            path={`/analyses/${paths.cytof}`}
                        />
                        <AnalysisListItem
                            title="RNA Expression"
                            path={`/analyses/${paths.rna}`}
                        />
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Route path="/analyses" exact>
                            <Redirect to="/cli-instructions"></Redirect>
                        </Route>
                        <Route
                            path="/analyses/:analysis"
                            render={(
                                rprops: RouteComponentProps<{
                                    analysis: string;
                                }>
                            ) => (
                                <AnalysesInstructions
                                    {...rprops}
                                    title={
                                        pathTitleMap[
                                            rprops.match.params.analysis
                                        ]
                                    }
                                    tokenButton={
                                        rprops.match.params.analysis ===
                                        paths.cli
                                    }
                                />
                            )}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default withRouter(AnalysesPage);
