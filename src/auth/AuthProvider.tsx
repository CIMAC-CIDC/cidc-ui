import * as React from "react";
import { UnregisteredAccount, Account } from "../model/account";
import auth0 from "auth0-js";
import history from "./History";
import { getAccountInfo } from "../api/api";
import nanoid from "nanoid";
import { RouteComponentProps, withRouter } from "react-router";
import { Location } from "history";
import IdleTimer from "react-idle-timer";
import { IDLE_TIMEOUT } from "../util/constants";
import Loader from "../components/generic/Loader";

const CLIENT_ID: string = process.env.REACT_APP_AUTH0_CLIENT_ID!;
const DOMAIN: string = process.env.REACT_APP_AUTH0_DOMAIN!;

const auth0Client = new auth0.WebAuth({
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
    auth0Client.logout({
        clientID: CLIENT_ID,
        returnTo: window.location.origin
    });
};

const handleAuthentication = (
    location: Location,
    sessionSetter: (
        authResult: auth0.Auth0DecodedHash,
        targetRoute: string
    ) => void
) => {
    auth0Client.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
            const targetRoute =
                "search" in location
                    ? new URLSearchParams(location.search).get("next") || "/"
                    : "/";
            sessionSetter(authResult, targetRoute);
        } else if (err) {
            history.replace("/");
        }
    });
};

const setSession = (
    setAuthData: React.Dispatch<React.SetStateAction<IAuthData | undefined>>,
    setUserAccount: React.Dispatch<React.SetStateAction<Account | undefined>>,
    onComplete: () => void
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
            console.error("userinfo missing required scope");
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

        getAccountInfo(idToken)
            .then(userAccount => {
                if (userAccount) {
                    setUserAccount(userAccount);
                    if (userAccount.approval_date) {
                        history.replace(targetRoute);
                    } else {
                        history.replace("/unactivated");
                    }
                    onComplete();
                }
            })
            .catch(error => {
                if (error.response === undefined) {
                    history.replace("/network-error");
                } else {
                    history.replace("/register");
                }
                onComplete();
            });
    } else {
        console.error("Cannot set session: missing id token");
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

export interface IAuth {
    authData?: IAuthData;
    userAccount?: Account;
    handleAuthCallback: (location: Location) => void;
    logout: () => void;
}

export const AuthContext = React.createContext<IAuth | undefined>(undefined);

export function useAuthContext() {
    return React.useContext(AuthContext)!;
}

type IAuthProviderProps = RouteComponentProps;

const AuthProvider: React.FunctionComponent<IAuthProviderProps> = props => {
    const [authData, setAuthData] = React.useState<IAuthData | undefined>(
        undefined
    );
    const [userAccount, setUserAccount] = React.useState<Account | undefined>(
        undefined
    );
    const [isSettingSession, setIsSettingSession] = React.useState<boolean>(
        true
    );

    const tokenDidExpire = isTokenExpired();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const clearDataAndLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("expiresAt");

        logout();
    };

    const sessionSetter = setSession(setAuthData, setUserAccount, () =>
        setIsSettingSession(false)
    );

    React.useEffect(() => {
        if (tokenDidExpire || !authData) {
            if (isLoggedIn) {
                auth0Client.checkSession({}, (err, authResult) => {
                    if (
                        authResult &&
                        authResult.accessToken &&
                        authResult.idToken
                    ) {
                        sessionSetter(authResult, props.location.pathname);
                    } else if (err) {
                        clearDataAndLogout();
                    }
                });
            }
        }
    }, [tokenDidExpire, isLoggedIn, props.location, sessionSetter, authData]);

    const handleAuthCallback = (location: Location) =>
        handleAuthentication(location, sessionSetter);

    const auth = {
        authData,
        userAccount,
        handleAuthCallback,
        logout: clearDataAndLogout
    };

    if (
        !isLoggedIn &&
        !["/callback", "/network-error"].includes(props.location.pathname)
    ) {
        login();
        return null;
    }

    const renderApp =
        isSettingSession && props.location.pathname !== "/callback";

    return (
        <AuthContext.Provider value={auth}>
            <IdleTimer
                ref={() => null}
                onIdle={logout}
                timeout={IDLE_TIMEOUT}
            />
            {renderApp ? <Loader /> : props.children}
        </AuthContext.Provider>
    );
};

export default withRouter(AuthProvider);
