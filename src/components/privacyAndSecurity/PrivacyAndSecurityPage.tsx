import * as React from "react";
import { Typography } from "@material-ui/core";

export default class PrivacyAndSecurityPage extends React.Component<any, {}> {
    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div>
                <Typography
                    variant="h5"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    CIDC Portal Privacy and Security Notice
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    This privacy notice applies solely to user information
                    collected by this website. It will notify you of the
                    following:
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    <li>
                        What personally identifiable information is collected
                        from you through the website, how it is used and with
                        whom it may be shared.
                    </li>
                    <li>
                        What choices are available to you regarding the use of
                        your data.
                    </li>
                    <li>
                        The security procedures in place to protect the misuse
                        of your information.
                    </li>
                    <li>
                        How you can correct any inaccuracies in the information.
                    </li>
                    <li>
                        What it means for you to use a system containing US
                        Government Data.
                    </li>
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    Information Collection, Use, and Sharing
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    We only have access to/collect information that you give us
                    via email, forms on this site, technical information for
                    tracking and experience improvements purposes, or other
                    direct contact from you. We will not sell or rent this
                    information to anyone.
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    We will not share your information with any third party
                    outside of our network without notifying you first.
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    Unless you ask us not to, we may contact you via email in
                    the future to tell you about system updates or issues and
                    changes to this privacy policy.
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    Your Access to and Control Over Information
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    You can do the following at any time by contacting us via
                    the email address given on our website:
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    <li>See what data we have about you, if any.</li>
                    <li>Change/correct any data we have about you.</li>
                    <li>Have us delete any data we have about you.</li>
                    <li>
                        Express any concern you have about our use of your data.
                    </li>
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    Security
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    We take precautions to protect your information. When you
                    submit sensitive information via the website, your
                    information is protected both online and offline.
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    Wherever we collect information, that information is
                    encrypted and transmitted to us in a secure way. You can
                    verify this by looking for a lock icon in the address bar
                    and looking for "https" at the beginning of the address of
                    the Web page.
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    While we use encryption to protect information transmitted
                    online, we also protect your information offline. Only
                    employees who need the information to perform a specific job
                    are granted access to personally identifiable information.
                    The computers/servers in which we store personally
                    identifiable information are kept in a secure environment.
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    Registration
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    In order to use this website, a user must first complete the
                    registration form. During registration a user is required to
                    give certain information (such as name, organization and
                    email address). We use this information to determine your
                    access control rights and your role in the CIMAC-CIDC
                    Community.
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    Cookies, User Tracking and Automatically collected data
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    We use "cookies" on this site. A cookie is a piece of data
                    stored on a site visitor's hard drive to help us improve
                    your access to our site and identify repeat visitors to our
                    site. For instance, when we use a cookie to identify you,
                    you would not have to log in on each request, thereby saving
                    time while on our site. We utilize tracking tools within the
                    site to learn how users are interacting with our interface,
                    collecting data about links visited and time spent on pages.
                    Cookies and user tracking can also enable us to enhance the
                    experience on our site for our users. We automatically
                    collect data about any request against our site including:
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    <li>URL and Domain Requested</li>
                    <li>Your IP Address</li>
                    <li>Type of browser and operating system you are using</li>
                    <li>Date and time of your requests to our site</li>
                    <li>The website that referred you to us, if applicable</li>
                </Typography>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    U.S. Government Information System
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    The term “U.S. Government information system” includes
                    systems operated on behalf of the U.S. Government; This
                    information system is operating on behalf of the National
                    Cancer Institute, an agency within the National Institutes
                    of Health. Due to the nature of data within this system, the
                    following provisions apply:
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    <li>
                        Unauthorized access to or unauthorized use of U.S.
                        Government information or information systems is subject
                        to criminal, civil, administrative or other lawful
                        action.
                    </li>
                    <li>
                        At any time, the U.S. Government may for any lawful
                        government purpose and without notice, monitor,
                        intercept, search and seize any authorized or
                        unauthorized communication to or from U.S. Government
                        information systems or information used or stored on
                        U.S. Government information systems.
                    </li>
                    <li>
                        At any time, the U.S. Government may for any lawful
                        government purpose, search and seize any authorized or
                        unauthorized device, to include non-U.S. Government
                        owned devices, that stores U.S. Government information.
                    </li>
                    <li>
                        Any communications or information used, transmitted or
                        stored on U.S. Government information systems may be
                        used or disclosed for any lawful government purpose,
                        including but not limited to, administrative purposes,
                        penetration testing, communication security monitoring,
                        personnel misconduct measures, law enforcement and
                        counterintelligence inquiries.
                    </li>
                </Typography>
            </div>
        );
    }
}
