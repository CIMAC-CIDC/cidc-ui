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
    Divider,
    Avatar,
    Button,
    TabProps,
    Box
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink,
    Link
} from "react-router-dom";
import logo from "../../logo.svg";
import {
    IAccountWithExtraContext,
    useUserContext
} from "../identity/UserProvider";
import { useRootStyles } from "../../rootStyles";
import { Person } from "@material-ui/icons";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import { AuthContext, login } from "../identity/AuthProvider";
import FadeInOnMount from "../generic/FadeInOnMount";

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

const UserProfileButton: React.FC<{ user: IAccountWithExtraContext }> = ({
    user
}) => {
    const userButton = (
        <Button disabled={!user} component={Link} to={"/profile"} disableRipple>
            <Grid
                container
                spacing={2}
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    {user.picture ? (
                        <Avatar
                            alt={`${user.first_n} ${user.last_n}'s avatar`}
                            src={user.picture}
                        />
                    ) : (
                        <Person fontSize="large" />
                    )}
                </Grid>
                <Grid item style={{ maxWidth: 150 }}>
                    <Typography variant="subtitle2">
                        {user.first_n} {user.last_n}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {ORGANIZATION_NAME_MAP[user.organization]}
                    </Typography>
                </Grid>
            </Grid>
        </Button>
    );

    return <FadeInOnMount>{userButton}</FadeInOnMount>;
};

interface IStyledTabsProps {
    value: string | false;
    onChange: (event: React.ChangeEvent<{}>, newValue: string) => void;
}

// @ts-ignore
const StyledTabs: typeof Tabs = withStyles({
    indicator: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
        "& > div": {
            width: "100%",
            backgroundColor: "black"
        }
    }
})((props: IStyledTabsProps) => (
    <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />
));

// @ts-ignore
const StyledTab: typeof Tab = withStyles({
    root: { minWidth: 120 }
})(Tab);

const NavTabs: React.FC<{ selectedTab: string | false; tabs: TabProps[] }> = ({
    selectedTab,
    tabs
}) => {
    return (
        <FadeInOnMount>
            <StyledTabs role="navigation" value={selectedTab}>
                {tabs.map(tab => {
                    return (
                        <StyledTab
                            key={tab.value}
                            component={Link}
                            disableRipple
                            to={tab.value}
                            value={tab.value}
                            label={tab.label}
                        />
                    );
                })}
            </StyledTabs>
        </FadeInOnMount>
    );
};

const useHeaderStyles = makeStyles({
    tabs: {
        paddingTop: 10,
        margin: 0,
        height: 134
    },
    logo: { height: 80, padding: 5, marginBottom: -40 }
});

export const DONT_RENDER_PATHS = ["/register", "/unactivated", "/callback"];

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const rootClasses = useRootStyles();
    const classes = useHeaderStyles();
    const { state: authState } = React.useContext(AuthContext);
    const user = useUserContext();

    let selectedTab: string | false = props.location.pathname;

    if (["/", "/privacy-security"].includes(selectedTab)) {
        selectedTab = false;
    } else if (DONT_RENDER_PATHS.includes(selectedTab)) {
        return null;
    } else {
        selectedTab = `/${selectedTab.split("/")[1]}`;
    }

    return (
        <div data-testid="header">
            <EnvBanner />
            <div className={classes.tabs}>
                <Grid
                    container
                    className={rootClasses.centeredPage}
                    direction="column"
                    wrap="nowrap"
                >
                    <Grid item>
                        <Grid
                            container
                            alignItems="baseline"
                            justify="space-between"
                        >
                            <Grid item>
                                <RouterLink to="/">
                                    <img
                                        src={logo}
                                        alt="Home"
                                        className={classes.logo}
                                    />
                                </RouterLink>
                            </Grid>
                            <Grid item>
                                {authState === "logged-in" && user && (
                                    <UserProfileButton user={user} />
                                )}
                                {authState === "logged-out" && (
                                    <Button
                                        size="large"
                                        color="primary"
                                        variant="outlined"
                                        onClick={() => login()}
                                    >
                                        sign up / log in
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item style={{ padding: 0 }}>
                        {user ? (
                            <NavTabs
                                selectedTab={selectedTab}
                                tabs={
                                    [
                                        {
                                            label: "browse data",
                                            value: "/browse-data"
                                        },
                                        user.showAssays && {
                                            label: "assays",
                                            value: "/assays"
                                        },
                                        user.showAnalyses && {
                                            label: "analyses",
                                            value: "/analyses"
                                        },
                                        user.showManifests && {
                                            label: "manifests",
                                            value: "/manifests"
                                        },
                                        {
                                            label: "pipelines",
                                            value: "/pipelines"
                                        },
                                        { label: "schema", value: "/schema" }
                                    ].filter(t => !!t) as TabProps[]
                                }
                            />
                        ) : (
                            <Box height={40} />
                        )}
                    </Grid>
                </Grid>
            </div>
            <Divider />
        </div>
    );
};

export default withRouter(Header);
