import * as React from "react";
import { AuthContext } from "./AuthProvider";
import { Account } from "../../model/account";
import { RouteComponentProps, withRouter } from "react-router";
import { getAccountInfo, getPermissionsForUser } from "../../api/api";
import history from "./History";
import { ErrorContext } from "../errors/ErrorGuard";
import Permission from "../../model/permission";
import ContactAnAdmin from "../generic/ContactAnAdmin";

export interface IAccountWithExtraContext extends Account {
    permissions?: Permission[];
    showAssays?: boolean;
    showAnalyses?: boolean;
    showManifests?: boolean;
}

export const UserContext = React.createContext<
    IAccountWithExtraContext | undefined
>(undefined);

export function useUserContext() {
    const user = React.useContext(UserContext)!;

    return user;
}

const UserProvider: React.FunctionComponent<RouteComponentProps> = props => {
    const authData = React.useContext(AuthContext);
    const setError = React.useCallback(React.useContext(ErrorContext), []);

    const [user, setUser] = React.useState<Account | undefined>(undefined);
    const [permissions, setPermissions] = React.useState<
        Permission[] | undefined
    >(undefined);

    React.useEffect(() => {
        if (authData.state === "logged-in") {
            const { user: authUser, idToken } = authData.userInfo;
            if (!user) {
                getAccountInfo(idToken)
                    .then(userAccount => {
                        setUser({ ...authUser, ...userAccount });
                        if (!userAccount.approval_date) {
                            history.replace("/");
                        }
                    })
                    .catch(error => {
                        const message = error.response?.data?._error?.message;
                        // If the user isn't registered, send them to the registration page.
                        // Otherwise, give up and display an error.
                        if (message?.includes("not registered")) {
                            history.replace("/register");
                        } else {
                            setError({
                                type: "Request Error",
                                message: "error loading account information"
                            });
                        }
                    });
            } else if (!permissions && user.role) {
                getPermissionsForUser(idToken, user.id).then(perms =>
                    setPermissions(perms)
                );
            }
        }

        // Show an informative message if the user is disabled
        if (user && user.disabled) {
            setError({
                type: "Login Error",
                message: "Account Disabled",
                description: (
                    <>
                        Your CIDC account has been disabled due to inactivity.{" "}
                        <ContactAnAdmin /> to reactivate your account.
                    </>
                )
            });
        }
    }, [
        authData,
        setError,
        user,
        permissions,
        props.history.location.pathname
    ]);

    const showAssays =
        user?.role &&
        ["cimac-biofx-user", "cidc-biofx-user", "cidc-admin"].includes(
            user.role
        );
    const showManifests =
        user?.role && ["nci-biobank-user", "cidc-admin"].includes(user.role);
    const showAnalyses =
        user?.role && ["cidc-biofx-user", "cidc-admin"].includes(user.role);

    const value = user && {
        ...user,
        permissions,
        showAssays,
        showManifests,
        showAnalyses
    };

    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    );
};

export default withRouter(UserProvider);
