import * as React from "react";
import {
    Tabs,
    Tab,
    Card,
    Typography,
    Link as MuiLink,
    Divider,
    Grid,
    withStyles,
    makeStyles
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink
} from "react-router-dom";
import logo from "../../logo.png";
import { AccountCircle, Search, TableChart } from "@material-ui/icons";
import { useUserContext } from "../identity/UserProvider";
import { colors, widths } from "../../rootStyles";

const ENV = process.env.REACT_APP_ENV;

const EnvBanner: React.FunctionComponent = () =>
    ENV !== "prod" ? (
        <Card
            style={{
                background:
                    "repeating-linear-gradient(45deg, #ffcc00, #ffcc00 10px, black 10px, black 20px)",
                padding: ENV === "staging" ? "1em" : "0",
                textAlign: "center"
            }}
        >
            <Typography
                variant="overline"
                style={{
                    background: "white",
                    padding: "0.5em",
                    lineHeight: "2em"
                }}
            >
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
    value: string | false;
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

const useHeaderStyles = makeStyles({
    tabs: {
        background: `linear-gradient(to right, white,${colors.LIGHT_BLUE} 300px, ${colors.LIGHT_BLUE})`,
        width: "100%",
        margin: 0
    },
    logo: { height: 87, padding: 5 }
});

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const classes = useHeaderStyles();
    const user = useUserContext();

    function handleChange(_: React.ChangeEvent<{}>, value: any) {
        props.history.push(value);
    }

    let selectedTab: string | false = props.location.pathname;
    if (selectedTab.startsWith("/assays")) {
        selectedTab = "/assays";
    } else if (selectedTab.startsWith("/analyses")) {
        selectedTab = "/analyses";
    } else if (selectedTab.startsWith("/file-details")) {
        selectedTab = "/browse-files";
    } else if (selectedTab.startsWith("/manifests")) {
        selectedTab = "/manifests";
    } else if (["/", "/privacy-security"].includes(selectedTab)) {
        selectedTab = false;
    } else if (
        ["/register", "/unactivated", "/callback"].includes(selectedTab)
    ) {
        return null;
    }

    return (
        <div style={{ minWidth: widths.pageWidth }}>
            <EnvBanner />
            <div className={classes.tabs}>
                <Grid
                    container
                    alignItems="center"
                    wrap="nowrap"
                    style={{ width: "100%", paddingBottom: "0" }}
                >
                    <Grid item>
                        <RouterLink to="/">
                            <img
                                src={logo}
                                className={classes.logo}
                                alt="Home"
                            />
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
                            {user && user.showAnalyses && (
                                <Tab
                                    disableRipple={true}
                                    value="/analyses"
                                    label="Analyses"
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
