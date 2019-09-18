import * as React from "react";
import { ADMIN_EMAIL } from "../../util/constants";
import { Link } from "@material-ui/core";

const ContactAnAdmin: React.FunctionComponent<{
    lower?: boolean;
}> = ({ lower }) => {
    const c = !!lower ? "c" : "C";

    return (
        <Link href={`mailto:${ADMIN_EMAIL}`}>
            {c}ontact a CIDC Administrator
        </Link>
    );
};

export default ContactAnAdmin;
