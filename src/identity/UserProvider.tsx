import * as React from "react";
import { AuthContext, AuthLoader } from "./AuthProvider";
import { Account } from "../model/account";
import { RouteComponentProps, withRouter } from "react-router";
import { getAccountInfo } from "../api/api";
import history from "./History";
import { ErrorContext } from "../components/errors/ErrorGuard";

export const UserContext = React.createContext<Account | undefined>(undefined);

export function useUserContext() {
    const user = React.useContext(UserContext)!;

    return user;
}

const UNACTIVATED_PATHS = ["/callback", "/register", "/unactivated"];

const UserProvider: React.FunctionComponent<RouteComponentProps> = props => {
    const authData = React.useContext(AuthContext);
    const setError = React.useCallback(React.useContext(ErrorContext), []);

    const [user, setUser] = React.useState<Account | undefined>(undefined);

    const idToken = authData && authData.idToken;
    React.useEffect(() => {
        if (idToken) {
            getAccountInfo(idToken)
                .then(userAccount => {
                    setUser(userAccount);
                    if (userAccount) {
                        if (!userAccount.approval_date) {
                            history.replace("/unactivated");
                        }
                    } else {
                        history.replace("/register");
                    }
                })
                .catch(error => {
                    if (error.response === undefined) {
                        setError({
                            type: "Network Error",
                            message: "could not load user account information"
                        });
                    } else {
                        history.replace("/register");
                    }
                });
        }
    }, [idToken, setError]);

    const isUnactivatedPath = UNACTIVATED_PATHS.includes(
        props.location.pathname
    );

    return (
        <UserContext.Provider value={user}>
            {((user || isUnactivatedPath) && <>{props.children}</>) || (
                <div data-testid="loader">
                    <AuthLoader />
                </div>
            )}
        </UserContext.Provider>
    );
};

export default withRouter(UserProvider);
