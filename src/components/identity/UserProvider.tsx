import * as React from "react";
import { AuthContext } from "./AuthProvider";
import { Account } from "../../model/account";
import { RouteComponentProps, withRouter } from "react-router";
import { IApiPage } from "../../api/api";
import { ErrorContext } from "../errors/ErrorGuard";
import Permission from "../../model/permission";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import useSWR from "swr";

export interface IAccountWithExtraContext extends Account {
    permissions?: Permission[];
    showAnalyses?: boolean;
    showManifests?: boolean;
    canDownload?: boolean;
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

    const { data: user, error } = useSWR<Account>(
        authData.state === "logged-in"
            ? ["/users/self", authData.userInfo.idToken]
            : null
    );
    React.useEffect(() => {
        if (user) {
            if (user?.disabled) {
                // user's account is registered and approved, but disabled
                setError({
                    type: "Login Error",
                    message: "Account Disabled",
                    description: (
                        <>
                            Your CIDC account has been disabled due to
                            inactivity. <ContactAnAdmin /> to reactivate your
                            account.
                        </>
                    )
                });
            } else if (!user?.approval_date) {
                // user is registered but not yet approved
                props.history.replace("/");
            }
        } else if (
            // user is authenticated but not yet registered
            error?.response?.data?._error?.message?.includes("not registered")
        ) {
            props.history.replace("/register");
        } else if (error) {
            setError({
                type: "Request Error",
                message: "error loading account information"
            });
        }
    }, [user, error, setError, props.history]);

    const { data: permissions } = useSWR<IApiPage<Permission>>(
        authData.state === "logged-in" && user
            ? [`/permissions?user_id=${user.id}`, authData.userInfo.idToken]
            : null
    );

    const showManifests =
        user?.role && ["nci-biobank-user", "cidc-admin"].includes(user.role);
    const showAnalyses =
        user?.role && ["cidc-biofx-user", "cidc-admin"].includes(user.role);
    const canDownload = user?.role !== "network-viewer";

    const value =
        authData.state === "logged-in" && user && permissions
            ? {
                  ...authData.userInfo.user,
                  ...user,
                  permissions: permissions._items,
                  showManifests,
                  showAnalyses,
                  canDownload
              }
            : undefined;

    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    );
};

export default withRouter(UserProvider);
