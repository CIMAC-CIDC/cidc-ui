import * as React from "react";
import {
    Tabs,
    Tab,
    Card,
    Typography,
    Link as MuiLink,
    Divider,
    Grid,
    withStyles
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink
} from "react-router-dom";
import "./Header.css";
import logo from "../../logo.png";
import { AccountCircle, Search, TableChart } from "@material-ui/icons";
import { useUserContext } from "../identity/UserProvider";

const ENV = process.env.REACT_APP_ENV;

const EnvBanner: React.FunctionComponent = () =>
    ENV !== "prod" ? (
        <Card
            style={{
                background: "#ffcc00",
                textAlign: "center"
            }}
        >
            <Typography variant="overline">
                Warning! You're accessing a development instance of the CIDC
                portal. If this is a mistake, please navigate to{" "}
                <MuiLink href="https://portal.cimac-network.org">
                    https://portal.cimac-network.org
                </MuiLink>
                .
            </Typography>
        </Card>
    ) : null;

interface IStyledTabsProps {
    value: string;
    onChange: (event: React.ChangeEvent<{}>, newValue: string) => void;
}

const StyledTabs = withStyles({
    indicator: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
        "& > div": {
            maxWidth: 60,
            width: "100%",
            backgroundColor: "black"
        }
    }
})((props: IStyledTabsProps) => (
    <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />
));

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const user = useUserContext();

    function handleChange(_: React.ChangeEvent<{}>, value: any) {
        props.history.push(value);
    }

    let selectedTab = props.location.pathname;
    if (selectedTab.startsWith("/assays")) {
        selectedTab = "/assays";
    } else if (selectedTab === "/callback") {
        return null;
    } else if (selectedTab.startsWith("/file-details")) {
        selectedTab = "/browse-files";
    } else if (selectedTab.startsWith("/manifests")) {
        selectedTab = "/manifests";
    } else if (["/register", "/unactivated"].includes(selectedTab)) {
        return null;
    }

    return (
        <div style={{ backgroundColor: "var(--light-grey-gradient)" }}>
            <EnvBanner />
            <div className="Header-tabs">
                <Grid
                    container
                    alignItems="center"
                    style={{ width: "100%", paddingBottom: "0" }}
                >
                    <Grid item>
                        <RouterLink to="/">
                            <img src={logo} className="Logo" alt="Home" />
                        </RouterLink>
                    </Grid>
                    <Grid item>
                        <StyledTabs value={selectedTab} onChange={handleChange}>
                            <Tab
                                disableRipple={true}
                                value="/browse-files"
                                label="Browse Files"
                                icon={<Search />}
                            />
                            {user && user.showAssays && (
                                <Tab
                                    disableRipple={true}
                                    value="/assays"
                                    label="Assays"
                                    icon={<TableChart />}
                                />
                            )}
                            {user && user.showManifests && (
                                <Tab
                                    disableRipple={true}
                                    value="/manifests"
                                    label="Manifests"
                                    icon={<TableChart />}
                                />
                            )}

                            <Tab
                                disableRipple={true}
                                value="/user-account"
                                label="Profile"
                                icon={<AccountCircle />}
                            />
                        </StyledTabs>
                    </Grid>
                </Grid>
            </div>

            <Divider light />
        </div>
    );
};

export default withRouter(Header);
