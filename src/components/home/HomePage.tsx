import * as React from "react";
import {
    Typography,
    Link,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider
} from "@material-ui/core";
import {
    Search,
    AccountCircle,
    Security,
    TableChart
} from "@material-ui/icons";
import history from "../identity/History";
import { UserContext } from "../identity/UserProvider";
import { widths } from "../../rootStyles";

const ListLink: React.FunctionComponent<{
    icon: React.ReactElement;
    href: string;
}> = props => (
    <ListItem button onClick={() => history.push(props.href)}>
        <ListItemAvatar>{props.icon}</ListItemAvatar>
        <ListItemText>{props.children}</ListItemText>
    </ListItem>
);

const HomePage: React.FunctionComponent = () => {
    const user = React.useContext(UserContext);

    return (
        <div
            style={{
                minWidth: 700,
                maxWidth: widths.pageWidth,
                margin: "auto"
            }}
        >
            <Typography
                variant="h4"
                style={{ textAlign: "center" }}
                gutterBottom
            >
                Welcome to the CIMAC-CIDC Data Portal
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                This site serves as the central data coordination hub for the{" "}
                <Link href="https://cimac-network.org">CIMAC-CIDC Network</Link>
                , an initiative of the NCI Cancer Moonshot that provides
                cutting-edge technology and expertise in genomic, proteomic, and
                functional molecular analysis to enhance clinical trials in
                cancer immune therapies.
            </Typography>
            <Divider style={{ margin: "2em 0" }} />
            <Typography gutterBottom>On this site, you can</Typography>
            <List>
                <ListLink icon={<Search />} href="/browse-files">
                    Browse ingested data
                </ListLink>
                {user && user.showAssays && (
                    <ListLink icon={<TableChart />} href="/assays">
                        Learn how to upload new assay data
                    </ListLink>
                )}
                {user && user.showAnalyses && (
                    <ListLink icon={<TableChart />} href="/analyses">
                        Learn how to upload new analysis data
                    </ListLink>
                )}
                {user && user.showManifests && (
                    <ListLink icon={<TableChart />} href="/manifests">
                        Upload a shipping/receiving manifest
                    </ListLink>
                )}
                <ListLink icon={<AccountCircle />} href="/user-account">
                    View your account info and data access permissions
                </ListLink>
                <ListLink icon={<Security />} href="/privacy-security">
                    Read our Privacy and Security notice
                </ListLink>
            </List>
        </div>
    );
};

export default HomePage;
