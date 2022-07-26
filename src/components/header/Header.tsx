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
    Box,
    Menu,
    MenuItem,
    Chip
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
import { AuthContext, login, logout } from "../identity/AuthProvider";
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

const UserProfileMenu: React.FC<{ user: IAccountWithExtraContext }> = ({
    user
}) => {
    const [
        menuAnchor,
        setMenuAnchor
    ] = React.useState<HTMLButtonElement | null>();

    const userProfileButton = (
        <>
            <Button
                disableRipple
                style={{ textTransform: "none", textAlign: "left", width: 225 }}
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={e => setMenuAnchor(e.currentTarget)}
            >
                <Grid
                    container
                    spacing={2}
                    justify="space-between"
                    alignItems="center"
                    wrap="nowrap"
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
            <Menu
                id="profile-menu"
                anchorEl={menuAnchor}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                open={!!menuAnchor}
                onClick={() => setMenuAnchor(null)}
                onClose={() => setMenuAnchor(null)}
            >
                {user.approval_date && (
                    <MenuItem component={Link} to="/profile">
                        Profile
                    </MenuItem>
                )}
                <MenuItem style={{ width: 225 }} onClick={() => logout()}>
                    Log Out
                </MenuItem>
            </Menu>
        </>
    );

    return <FadeInOnMount>{userProfileButton}</FadeInOnMount>;
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
        margin: 0,
        paddingTop: 10
    },
    logo: { height: 80, padding: 5, marginBottom: -40 }
});

export const DONT_RENDER_PATHS = ["/callback"];

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const rootClasses = useRootStyles();
    const classes = useHeaderStyles();
    const { state: authState } = React.useContext(AuthContext);
    const user = useUserContext();

    let selectedTab: string | false = props.location.pathname;

    if (
        ["/", "/register", "/privacy-security", "/profile"].includes(
            selectedTab
        )
    ) {
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
                                    <UserProfileMenu user={user} />
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
                        {// only show tabs to approved users
                        user && user.approval_date ? (
                            <NavTabs
                                selectedTab={selectedTab}
                                tabs={
                                    [
                                        {
                                            label: "browse data",
                                            value: "/browse-data"
                                        },

                                        (user.showAssays ||
                                            user.showAnalyses) && {
                                            label: "transfer data",
                                            value: "/transfer-data"
                                        },
                                        user.showAnalyses && {
                                            label: "transfer analyses",
                                            value: "/analyses"
                                        },
                                        user.showManifests && {
                                            label: "transfer manifests",
                                            value: "/manifests"
                                        },
                                        {
                                            label: "pipelines",
                                            value: "/pipelines"
                                        },
                                        { label: "schema", value: "/schema" },
                                        {
                                            label: "data overview",
                                            value: "/data-overview"
                                        },
                                        {
                                            label: (
                                                <div>
                                                    data exploration{" "}
                                                    <Box
                                                        display="inline"
                                                        pl={1}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            label="beta"
                                                            variant="outlined"
                                                            color="secondary"
                                                        />
                                                    </Box>
                                                </div>
                                            ),
                                            value: "/data-exploration"
                                        }
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
