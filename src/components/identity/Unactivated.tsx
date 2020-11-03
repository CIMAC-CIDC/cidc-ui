import * as React from "react";
import { Typography } from "@material-ui/core";
import history from "./History";
import { useUserContext } from "./UserProvider";
import ContactAnAdmin from "../generic/ContactAnAdmin";

export default function Unactivated() {
    const user = useUserContext();

    // If the user is approved, they should be redirected home
    if (user && user.approval_date) {
        history.replace("/");
    }

    return (
        <div data-testid="unactivated-message">
            <div>CIDC Registration Request</div>
            <div>
                <Typography paragraph>
                    Thank for you for submitting a registration request for the
                    CIMAC-CIDC Data Portal.
                </Typography>
                <Typography paragraph>
                    If you are a member of the CIMAC Network, we will issue an
                    "@cimac-network.org" email account to you that you can use
                    to access the CIDC Portal once data for your trial(s) become
                    available on the site.
                </Typography>
                <Typography paragraph>
                    In the meantime, feel free to <ContactAnAdmin lower /> with
                    any questions you may have.
                </Typography>
            </div>
        </div>
    );
}
