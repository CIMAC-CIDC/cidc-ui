import * as React from "react";
import { ADMIN_EMAIL } from "../../util/constants";

const ContactAnAdmin = () => (
    <a href={`mailto:${ADMIN_EMAIL}`}>Contact a CIDC Administrator</a>
);

export default ContactAnAdmin;
