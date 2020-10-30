import * as React from "react";
import { Link as MuiLink, Grid, Box, Typography } from "@material-ui/core";
import MuiRouterLink from "../generic/MuiRouterLink";
import { theme } from "../../rootStyles";

const Footer: React.FC = () => {
    return (
        <Box bgcolor={theme.palette.grey["100"]}>
            <Grid
                container
                justify="center"
                spacing={5}
                style={{ maxWidth: "100%" }}
            >
                <Grid item>
                    <Typography>
                        &copy; {new Date().getFullYear()} CIDC @ Dana-Farber
                        Cancer Institute
                    </Typography>
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
                                <Typography>About</Typography>
                            </MuiLink>
                        </Grid>
                        <Grid item>
                            <MuiRouterLink
                                LinkProps={{ underline: "none" }}
                                to="/privacy-security"
                            >
                                <Typography>Privacy and Security</Typography>
                            </MuiRouterLink>
                        </Grid>
                        <Grid item>
                            <MuiLink
                                underline="none"
                                href="https://github.com/cimac-cidc"
                            >
                                <Typography>GitHub</Typography>
                            </MuiLink>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Footer;
