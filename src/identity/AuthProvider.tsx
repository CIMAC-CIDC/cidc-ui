import * as React from "react";
import { UnregisteredAccount } from "../model/account";
import auth0 from "auth0-js";
import history from "./History";
import nanoid from "nanoid";
import { RouteComponentProps, withRouter } from "react-router";
import { Location } from "history";
import IdleTimer from "react-idle-timer";
import Loader from "../components/generic/Loader";
import { Grid } from "@material-ui/core";
import { IError, ErrorContext } from "../components/errors/ErrorGuard";

const CLIENT_ID: string = process.env.REACT_APP_AUTH0_CLIENT_ID!;
const DOMAIN: string = process.env.REACT_APP_AUTH0_DOMAIN!;
const IDLE_TIMEOUT: number = 1000 * 60 * 15;

export const auth0Client = new auth0.WebAuth({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    redirectUri: window.location.origin + "/callback",
    responseType: "token id_token",
    scope: "openid profile email"
});

const login = () => {
    auth0Client.authorize({
        redirectUri:
            window.location.origin +
            "/callback?next=" +
            encodeURIComponent(
                window.location.pathname + window.location.search
            ),
        nonce: nanoid()
    });
};

const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("expiresAt");

    auth0Client.logout({
        returnTo: window.location.origin
    });
};

export const handleAuthentication = (
    location: Location,
    sessionSetter: (
        authResult: auth0.Auth0DecodedHash,
        targetRoute: string
    ) => void,
    setError: (error: IError) => void
) => {
    auth0Client.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
            const targetRoute =
                "search" in location
                    ? new URLSearchParams(location.search).get("next") || "/"
                    : "/";
            sessionSetter(authResult, targetRoute);
        } else {
            if (err) {
                console.error(err);
            }
            setError({
                type: "Login Error",
                message: "authentication failed"
            });
        }
    });
};

export const setSession = (
    setAuthData: React.Dispatch<React.SetStateAction<IAuthData | undefined>>,
    onComplete: () => void,
    setError: (error: IError) => void
) => (
    { idTokenPayload: tokenInfo, idToken }: auth0.Auth0DecodedHash,
    targetRoute: string
) => {
    if (idToken && tokenInfo) {
        if (
            !tokenInfo.email ||
            !tokenInfo.given_name ||
            !tokenInfo.family_name
        ) {
            setError({
                type: "Login Error",
                message: "userinfo missing required scope(s)"
            });

            return;
        }

        localStorage.setItem("isLoggedIn", "true");

        const expiresAt = tokenInfo.exp * 1000;
        localStorage.setItem("expiresAt", String(expiresAt));

        const user = {
            email: tokenInfo.email,
            first_n: tokenInfo.given_name,
            last_n: tokenInfo.family_name
        };

        setAuthData({
            idToken: idToken!,
            user
        });

        history.replace(targetRoute);
        onComplete();
    } else {
        setError({
            type: "Login Error",
            message: "cannot set session: missing id token"
        });
    }
};

const isTokenExpired = () => {
    const expiresAt = localStorage.getItem("expiresAt");
    return expiresAt && new Date().getTime() >= parseInt(expiresAt, 10);
};

export interface IAuthData {
    idToken: string;
    user: UnregisteredAccount;
}

export const AuthContext = React.createContext<IAuthData | undefined>(
    undefined
);

export const AuthLoader = () => (
    <Grid
        container
        justify="center"
        alignItems="center"
        style={{ height: "10vh" }}
    >
        <Grid item>
            <Loader />
        </Grid>
    </Grid>
);

const AuthProvider: React.FunctionComponent<RouteComponentProps> = props => {
    const setError = React.useContext(ErrorContext);

    const [authData, setAuthData] = React.useState<IAuthData | undefined>(
        undefined
    );
    const [sessionIsSet, setSessionIsSet] = React.useState<boolean>(false);

    const sessionSetter = setSession(
        setAuthData,
        () => setSessionIsSet(true),
        setError
    );
    const tokenDidExpire = isTokenExpired();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    React.useEffect(() => {
        const isLoggingOut = props.location.pathname === "/logout";
        if ((tokenDidExpire || !authData) && !isLoggingOut) {
            if (isLoggedIn) {
                auth0Client.checkSession({}, (err, authResult) => {
                    if (
                        authResult &&
                        authResult.accessToken &&
                        authResult.idToken
                    ) {
                        sessionSetter(
                            authResult,
                            props.location.pathname + props.location.search
                        );
                    } else {
                        if (err) {
                            console.error(err);
                        }
                        logout();
                    }
                });
            }
        }
    }, [tokenDidExpire, isLoggedIn, props.location, sessionSetter, authData]);

    const isCallback = props.location.pathname === "/callback";

    // If the user is logged out, try to log them in, unless they
    // are trying to access a public path
    if (!isLoggedIn && !isCallback) {
        login();
        return null;
    }

    // Handle when the Auth0 authorization flow redirects to the callback endpoint
    if (isCallback) {
        return (
            <div data-testid="callback-loader">
                <AuthCallback
                    onLoad={() =>
                        handleAuthentication(
                            props.location,
                            sessionSetter,
                            setError
                        )
                    }
                />
            </div>
        );
    }

    // Log the user out
    if (props.location.pathname === "/logout") {
        logout();
        return null;
    }

    // Session setup still in progress
    if (!sessionIsSet) {
        return (
            <div data-testid="session-loader">
                <AuthLoader data-testid="session-loader" />
            </div>
        );
    }

    // The user is authenticated, so render the app
    return (
        <AuthContext.Provider value={authData}>
            <IdleTimer
                ref={() => null}
                onIdle={logout}
                timeout={IDLE_TIMEOUT}
            />
            {props.children}
        </AuthContext.Provider>
    );
};

export default withRouter(AuthProvider);

export function withIdToken(
    Component: React.ComponentType<any>
): React.FunctionComponent {
    return (props: any) => {
        const authData = React.useContext(AuthContext);

        return <Component {...props} token={authData && authData.idToken} />;
    };
}

function AuthCallback(props: { onLoad: () => void }) {
    const onLoad = React.useCallback(props.onLoad, []);
    React.useEffect(onLoad, []);

    return <AuthLoader />;
}
