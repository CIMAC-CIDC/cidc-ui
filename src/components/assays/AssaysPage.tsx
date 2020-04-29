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
import { useRootStyles } from "../../rootStyles";

const paths = {
    cli: "cli-instructions",
    wes: "wes",
    rna: "rna",
    olink: "olink",
    cytof: "cytof",
    ihc: "ihc",
    elisa: "elisa",
    mif: "mif"
};

const pathTitleMap = {
    [paths.cli]: "The CIDC Command-Line Interface",
    [paths.wes]: "WES upload",
    [paths.rna]: "RNA Expression upload",
    [paths.olink]: "Olink upload",
    [paths.cytof]: "CyTOF upload",
    [paths.ihc]: "IHC upload",
    [paths.elisa]: "ELISA upload",
    [paths.mif]: "mIF upload"
};

const AssaysPage: React.FunctionComponent<RouteComponentProps> = props => {
    const classes = useRootStyles();

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

    const menuWidth = 200;

    return (
        <div className={classes.centeredPage}>
            <Grid container direction="row">
                <Grid item style={{ width: menuWidth }}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            General Overview
                        </ListSubheader>
                        <AssayListItem
                            title="CLI Instructions"
                            path={`/${paths.cli}`}
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
                        <AssayListItem
                            title="RNA Expression"
                            path={`/assays/${paths.rna}`}
                        />
                        <AssayListItem
                            title="IHC"
                            path={`/assays/${paths.ihc}`}
                        />
                        <AssayListItem
                            title="ELISA"
                            path={`/assays/${paths.elisa}`}
                        />
                        <AssayListItem
                            title="mIF"
                            path={`/assays/${paths.mif}`}
                        />
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Route path="/assays" exact>
                            <Redirect to="/cli-instructions"></Redirect>
                        </Route>
                        <Route
                            path="/assays/:assay"
                            render={(
                                rprops: RouteComponentProps<{ assay: string }>
                            ) => (
                                <AssayInstructions
                                    {...rprops}
                                    title={
                                        pathTitleMap[rprops.match.params.assay]
                                    }
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
