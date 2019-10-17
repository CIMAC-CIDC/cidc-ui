import * as React from "react";
import { AuthContext, AuthLoader } from "./AuthProvider";
import { Account } from "../../model/account";
import { RouteComponentProps, withRouter } from "react-router";
import { getAccountInfo, getPermissionsForUser } from "../../api/api";
import history from "./History";
import { ErrorContext } from "../errors/ErrorGuard";
import Permission from "../../model/permission";

export interface IAccountWithExtraContext extends Account {
    permissions?: Permission[];
    showAssays?: boolean;
    showManifests?: boolean;
}

export const UserContext = React.createContext<
    IAccountWithExtraContext | undefined
>(undefined);

export function useUserContext() {
    const user = React.useContext(UserContext)!;

    return user;
}

const UNACTIVATED_PATHS = ["/callback", "/register", "/unactivated"];

const UserProvider: React.FunctionComponent<RouteComponentProps> = props => {
    const authData = React.useContext(AuthContext);
    const setError = React.useCallback(React.useContext(ErrorContext), []);

    const [user, setUser] = React.useState<Account | undefined>(undefined);
    const [permissions, setPermissions] = React.useState<
        Permission[] | undefined
    >(undefined);

    const idToken = authData && authData.idToken;
    React.useEffect(() => {
        if (idToken) {
            if (!user) {
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
                                message:
                                    "could not load user account information"
                            });
                        } else {
                            history.replace("/register");
                        }
                    });
            } else if (!permissions) {
                getPermissionsForUser(idToken, user.id).then(perms =>
                    setPermissions(perms)
                );
            }
        }
    }, [idToken, setError, user, permissions]);

    const showAssays =
        user &&
        user.role &&
        ["cimac-biofx-user", "cidc-admin"].includes(user.role);
    const showManifests =
        user &&
        user.role &&
        ["nci-biobank-user", "cidc-admin"].includes(user.role);

    const isUnactivatedPath = UNACTIVATED_PATHS.includes(
        props.location.pathname
    );

    const value = user && { ...user, permissions, showAssays, showManifests };

    return (
        <UserContext.Provider value={value}>
            {((user || isUnactivatedPath) && <>{props.children}</>) || (
                <div data-testid="loader">
                    <AuthLoader />
                </div>
            )}
        </UserContext.Provider>
    );
};

export default withRouter(UserProvider);
