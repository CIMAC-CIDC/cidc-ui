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
import { colors } from "../../rootStyles";
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

export const EnvBanner: React.FunctionComponent = () =>
    ENV !== "prod" ? (
        <Card
            style={{
                background:
                    "repeating-linear-gradient(45deg, #ffcc00, #ffcc00 10px, black 10px, black 20px)",
                padding: "1em",
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

export const CIDCBreadcrumbs = withRouter(props => {
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
                            key={label}
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

const StyledTab = withStyles({
    root: {
        minWidth: 120
    }
})(Tab);

const useHeaderStyles = makeStyles({
    tabs: {
        background: `linear-gradient(to right, white,${colors.LIGHT_BLUE} 300px, ${colors.LIGHT_BLUE})`,
        minWidth: "100%",
        margin: 0
    },
    logo: { height: 87, padding: 5 }
});

export const DONT_RENDER_PATHS = ["/register", "/unactivated", "/callback"];

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const classes = useHeaderStyles();
    const user = useUserContext();

    function handleChange(_: React.ChangeEvent<{}>, value: any) {
        props.history.push(value);
    }

    let selectedTab: string | false = props.location.pathname;

    if (["/", "/privacy-security"].includes(selectedTab)) {
        selectedTab = false;
    } else if (DONT_RENDER_PATHS.includes(selectedTab)) {
        return null;
    } else {
        selectedTab = `/${selectedTab.split("/")[1]}`;
    }

    return (
        <div data-testid="header" style={{ width: "100%" }}>
            <EnvBanner />
            <div className={classes.tabs}>
                <Grid container alignItems="center" wrap="nowrap" spacing={1}>
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
                            <StyledTab
                                disableRipple={true}
                                value="/browse-data"
                                label="browse data"
                                icon={<Search />}
                            />
                            {user && user.showAssays && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/assays"
                                    label="Assays"
                                    icon={<TableChart />}
                                />
                            )}
                            {user && user.showAnalyses && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/analyses"
                                    label="Analyses"
                                    icon={<TableChart />}
                                />
                            )}
                            {user && user.showManifests && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/manifests"
                                    label="Manifests"
                                    icon={<TableChart />}
                                />
                            )}
                            <StyledTab
                                disableRipple={true}
                                value="/pipelines"
                                label="Pipelines"
                                icon={<DeviceHub />}
                            />
                            <StyledTab
                                disableRipple={true}
                                value="/schema"
                                label="Schema"
                                icon={<Code />}
                            />
                            <StyledTab
                                disableRipple={true}
                                value="/profile"
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
