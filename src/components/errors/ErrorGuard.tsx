import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { ErrorOutline } from "@material-ui/icons";

const ERROR_TYPES = ["network", "login"];

const ErrorGuard: React.FunctionComponent<RouteComponentProps> = ({
    location,
    children
}) => {
    if (location.pathname !== "/error") {
        return <>{children}</>;
    }

    const errorType =
        "search" in location &&
        new URLSearchParams(location.search).get("type");

    const errorTitle =
        errorType && ERROR_TYPES.includes(errorType)
            ? `${errorType.toUpperCase()} ERROR`
            : "ERROR";

    return (
        <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: "80vh" }}
        >
            <Grid item>
                <Card color="inherit">
                    <CardHeader avatar={<ErrorOutline />} title={errorTitle} />
                    <CardContent>
                        Encountered a problem loading the CIDC Portal. Please{" "}
                        <ContactAnAdmin lower /> if this issue persists.
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default withRouter(ErrorGuard);
