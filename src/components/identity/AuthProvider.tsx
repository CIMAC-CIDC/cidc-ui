import * as React from "react";
import { UnregisteredAccount } from "../../model/account";
import auth0 from "auth0-js";
import nanoid from "nanoid";
import { RouteComponentProps, withRouter } from "react-router";
import IdleTimer from "react-idle-timer";
import { StringParam, useQueryParam } from "use-query-params";

const CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID!;
const DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN!;
const IDLE_TIMEOUT = 1000 * 60 * 30;
const REDIRECT_URI = `${window.location.origin}/callback`;
const TARGET_PARAM = "returnTo";

export const auth0Client = new auth0.WebAuth({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    responseType: "token id_token",
    scope: "openid profile email"
});

export const login = () => {
    const returnToURL = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
    );
    auth0Client.authorize({
        redirectUri: `${REDIRECT_URI}?${TARGET_PARAM}=${returnToURL}`,
        nonce: nanoid()
    });
};

export const logout = () => {
    auth0Client.logout({ returnTo: window.location.origin });
};

interface IUserInfo {
    idToken: string;
    user: UnregisteredAccount;
}

export type IAuthData =
    | { state: "loading" }
    | { state: "logged-out" }
    | {
          state: "logged-in";
          userInfo: IUserInfo;
      };

export const AuthContext = React.createContext<IAuthData>({ state: "loading" });

const AuthProvider: React.FunctionComponent<RouteComponentProps> = props => {
    const [authData, setAuthData] = React.useState<IAuthData>({
        state: "loading"
    });

    const checkSession = React.useCallback(() => {
        auth0Client.checkSession({}, (err, res) => {
            if (err?.code === "login_required") {
                // Don't automatically log in if the user is visiting the home page
                if (props.history.location.pathname === "/") {
                    setAuthData({ state: "logged-out" });
                } else {
                    login();
                }
            } else {
                const {
                    email,
                    given_name,
                    family_name,
                    picture
                } = res.idTokenPayload;

                setAuthData({
                    state: "logged-in",
                    userInfo: {
                        idToken: res.idToken as string,
                        user: {
                            email,
                            first_n: given_name,
                            last_n: family_name,
                            picture
                        }
                    }
                });
            }
        });
    }, [props.history.location.pathname]);

    const targetPath = useQueryParam(TARGET_PARAM, StringParam)[0];
    const onRedirectCallback = React.useCallback(() => {
        // Do not redirect to targetPath that starts with "/callback",
        // since this would lead to recursive redirection.
        if (targetPath && !targetPath.startsWith("/callback")) {
            props.history.push(targetPath);
        } else {
            props.history.push("/");
        }
    }, [props.history, targetPath]);

    React.useEffect(() => {
        if (props.location.pathname === "/logout") {
            logout();
            return;
        }
        if (props.location.pathname === "/callback") {
            onRedirectCallback();
            return;
        }
        if (authData.state !== "logged-in") {
            checkSession();
        }
    }, [
        props.location,
        authData.state,
        props.location.pathname,
        checkSession,
        onRedirectCallback
    ]);

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

/**
 * Inject the current user's identity token into the wrapped component as a prop
 * called token. If auth data is loading, the component won't be rendered. If
 * the current user is not logged in, the component will be rendered with an undefined
 * `token` prop.
 */
export function withIdToken<P>(
    Component: React.ComponentType<any>
): React.FunctionComponent<P> {
    return (props: any) => {
        const auth = React.useContext(AuthContext);

        if (auth.state === "loading") {
            return null;
        }

        return (
            <Component
                {...props}
                token={auth.state === "logged-in" && auth.userInfo.idToken}
            />
        );
    };
}
