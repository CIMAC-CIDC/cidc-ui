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
import AssayInstructions from "./AssayInstructions";

const paths = {
    cli: "cli-instructions",
    wes: "wes",
    olink: "olink",
    cytof: "cytof"
};

const AssaysPage: React.FunctionComponent<RouteComponentProps> = props => {
    const AssayListItem: React.FunctionComponent<{
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

    return (
        <div>
            <Grid container direction="row">
                <Grid item lg={2}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            General Overview
                        </ListSubheader>
                        <AssayListItem
                            title="CLI Instructions"
                            path={`/assays/${paths.cli}`}
                        />
                        <ListSubheader disableSticky>
                            Assay-Specific Docs
                        </ListSubheader>
                        <AssayListItem
                            title="Olink"
                            path={`/assays/${paths.olink}`}
                        />
                        <AssayListItem
                            title="CyTOF"
                            path={`/assays/${paths.cytof}`}
                        />
                        <AssayListItem
                            title="WES"
                            path={`/assays/${paths.wes}`}
                        />
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Route path="/assays" exact>
                            <Redirect to="/assays/cli-instructions"></Redirect>
                        </Route>
                        <Route
                            path="/assays/:assay"
                            render={(
                                rprops: RouteComponentProps<{ assay: string }>
                            ) => (
                                <AssayInstructions
                                    {...rprops}
                                    tokenButton={
                                        rprops.match.params.assay === paths.cli
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

export default withRouter(AssaysPage);
