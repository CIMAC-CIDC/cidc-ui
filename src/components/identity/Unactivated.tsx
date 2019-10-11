import * as React from "react";
import { Typography } from "@material-ui/core";
import "./Register.css";
import history from "./History";
import { useUserContext } from "./UserProvider";

export default function Unactivated() {
    const user = useUserContext();

    // If the user is approved, they should be redirected home
    if (user && user.approval_date) {
        history.replace("/");
    }

    return (
        <div data-testid="unactivated-message">
            <div className="Register-header">Registration</div>
            <Typography
                style={{
                    fontSize: 20,
                    width: "70%",
                    margin: "auto",
                    paddingTop: 25
                }}
            >
                Thank for you registering for the CIMAC-CIDC Data Portal. We
                will email you when your authorization request has been
                completed.
            </Typography>
        </div>
    );
}
