import * as React from "react";
import { Link as MuiLink, Grid } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router";
import MuiRouterLink from "../generic/MuiRouterLink";

class Footer extends React.Component<RouteComponentProps, {}> {
    public render() {
        return (
            <div>
                <Grid container justify="center" spacing={5}>
                    <Grid item>
                        &copy; {new Date().getFullYear()} CIDC @ Dana-Farber
                        Cancer Institute{" "}
                    </Grid>
                    <Grid item>
                        <Grid
                            container
                            justify="space-between"
                            wrap="nowrap"
                            spacing={2}
                        >
                            <Grid item>
                                <MuiLink
                                    underline="none"
                                    href="https://cimac-network.org/cidc/"
                                >
                                    About
                                </MuiLink>
                            </Grid>
                            <Grid item>
                                <MuiRouterLink
                                    LinkProps={{ underline: "none" }}
                                    to="/privacy-security"
                                >
                                    Privacy and Security
                                </MuiRouterLink>
                            </Grid>
                            <Grid item>
                                <MuiLink
                                    underline="none"
                                    href="https://github.com/cimac-cidc"
                                >
                                    GitHub
                                </MuiLink>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withRouter(Footer);
