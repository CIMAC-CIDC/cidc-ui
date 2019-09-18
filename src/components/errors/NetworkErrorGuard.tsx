import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { ErrorOutline } from "@material-ui/icons";

const NetworkErrorGuard: React.FunctionComponent<RouteComponentProps> = ({
    location,
    children
}) =>
    location.pathname === "/network-error" ? (
        <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: "80vh" }}
        >
            <Grid item>
                <Card color="inherit">
                    <CardHeader
                        avatar={<ErrorOutline />}
                        title="Network Error"
                    />
                    <CardContent>
                        Unable to connect to the CIDC. Please{" "}
                        <ContactAnAdmin lower /> if this problem persists.
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    ) : (
        <>{children}</>
    );

export default withRouter(NetworkErrorGuard);
