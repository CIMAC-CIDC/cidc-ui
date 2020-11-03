import React from "react";
import { withRouter } from "react-router-dom";
import AuthProvider, { AuthContext } from "./AuthProvider";
import FullPageLoader from "../generic/FullPageLoader";
import UserProvider, { UserContext } from "./UserProvider";

export const PUBLIC_PATHS = ["/", "/callback", "/register"];

export const IdentityProviderChildren = withRouter(({ history, children }) => {
    const authData = React.useContext(AuthContext);
    const userData = React.useContext(UserContext);

    const pageIsPublic = PUBLIC_PATHS.includes(history.location.pathname);
    const userIsAuthenticated = authData.state !== "loading" && !!userData;

    return pageIsPublic || userIsAuthenticated ? (
        <>{children}</>
    ) : (
        <FullPageLoader />
    );
});

const IdentityProvider: React.FC = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <IdentityProviderChildren children={children} />
            </UserProvider>
        </AuthProvider>
    );
};

export default IdentityProvider;
