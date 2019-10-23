import * as React from "react";
import { Link as MuiLink, Grid } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

export default class Footer extends React.Component<{}, {}> {
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
                                <RouterLink
                                    style={{ textDecoration: "none" }}
                                    to="/privacy-security"
                                >
                                    <MuiLink underline="none">
                                        Privacy and Security
                                    </MuiLink>
                                </RouterLink>
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
