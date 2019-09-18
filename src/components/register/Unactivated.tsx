import * as React from "react";
import { Typography } from "@material-ui/core";
import "./Register.css";
import history from "../../auth/History";
import { useAuthContext } from "../../auth/AuthProvider";

export default function Unactivated() {
    const { userAccount } = useAuthContext();

    // If the user is approved, they should be redirected home
    if (userAccount && userAccount.approval_date) {
        history.replace("/");
    }

    return (
        <>
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
        </>
    );
}
