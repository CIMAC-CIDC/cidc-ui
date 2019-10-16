import * as React from "react";
import {
    List,
    Grid,
    ListItem,
    ListItemText,
    Divider,
    Typography,
    Button,
    ListSubheader
} from "@material-ui/core";
import { RouteComponentProps, Route, withRouter, Redirect } from "react-router";
import AssayInstructions from "./AssayInstructions";
import CopyToClipboard from "react-copy-to-clipboard";
import { Fingerprint } from "@material-ui/icons";
import { AuthContext } from "../identity/AuthProvider";

const CopyIdToken: React.FunctionComponent = () => {
    const authData = React.useContext(AuthContext);
    const [copied, setCopied] = React.useState<boolean>(false);

    return (
        <CopyToClipboard text={authData ? authData.idToken : ""}>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Fingerprint />}
                disabled={!authData || copied}
                onClick={() => setCopied(true)}
            >
                {copied ? "Token Copied!" : "Copy Identity Token"}
            </Button>
        </CopyToClipboard>
    );
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
            <Grid
                container
                direction="row"
                alignItems="center"
                justify="space-between"
            >
                <Grid item>
                    <Typography variant="overline" style={{ fontSize: 24 }}>
                        Assay Upload Documentation
                    </Typography>
                </Grid>
                <Grid item>
                    <CopyIdToken />
                </Grid>
            </Grid>
            <Divider />
            <Grid container direction="row">
                <Grid item lg={2}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader>General Overview</ListSubheader>
                        <AssayListItem
                            title="CLI Instructions"
                            path="/assays/cli-instructions"
                        />
                        <ListSubheader>
                            Assay-Specific Documentation
                        </ListSubheader>
                        <AssayListItem title="Olink" path="/assays/olink" />
                        <AssayListItem title="CyTOF" path="/assays/cytof" />
                        <AssayListItem title="WES" path="/assays/wes" />
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
                            component={AssayInstructions}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default withRouter(AssaysPage);
