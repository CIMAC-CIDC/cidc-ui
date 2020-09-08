import * as React from "react";
import {
    Tabs,
    Tab,
    Card,
    Typography,
    Link as MuiLink,
    Grid,
    withStyles,
    makeStyles,
    Breadcrumbs,
    Box
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink
} from "react-router-dom";
import logo from "../../logo.png";
import { useUserContext } from "../identity/UserProvider";
import { colors, widths } from "../../rootStyles";
import { theme } from "../../App";
import MuiRouterLink from "../generic/MuiRouterLink";
import {
    TableChart,
    Search,
    AccountCircle,
    DeviceHub,
    Code
} from "@material-ui/icons";

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

const CIDCBreadcrumbs = withRouter(props => {
    const parts = props.location.pathname.split("/").slice(1);
    const labels = ["CIDC", ...parts.map(p => p.replace(/-/g, " "))].filter(
        l => l !== ""
    );
    const linkLabels = labels.slice(0, labels.length - 1);
    const lastLabel = labels[labels.length - 1];

    return (
        <Box px={3} bgcolor={theme.palette.grey["100"]}>
            <Breadcrumbs>
                {linkLabels.map((label, i) => {
                    return (
                        <MuiRouterLink
                            LinkProps={{ color: "inherit" }}
                            to={"/" + parts.slice(0, i).join("/")}
                        >
                            <Typography variant="overline" key={label}>
                                {label}
                            </Typography>
                        </MuiRouterLink>
                    );
                })}
                <Typography variant="overline" color="textPrimary">
                    {lastLabel}
                </Typography>
            </Breadcrumbs>
        </Box>
    );
});

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

    if (["/", "/privacy-security"].includes(selectedTab)) {
        selectedTab = false;
    } else if (
        ["/register", "/unactivated", "/callback"].includes(selectedTab)
    ) {
        return null;
    } else {
        selectedTab = `/${selectedTab.split("/")[1]}`;
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
                            {/* {user && user.showTrials && (
                                <Tab
                                    disableRipple={true}
                                    value="/trials"
                                    label="Trials"
                                    icon={<TableChart />}
                                />
                            )} */}
                            <Tab
                                disableRipple={true}
                                value="/pipelines"
                                label="Pipelines"
                                icon={<DeviceHub />}
                            />
                            <Tab
                                disableRipple={true}
                                value="/schema"
                                label="Schema"
                                icon={<Code />}
                            />
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
            {selectedTab && <CIDCBreadcrumbs />}
        </div>
    );
};

export default withRouter(Header);
