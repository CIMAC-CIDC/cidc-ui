import * as React from "react";
import auth0, { Auth0DecodedHash, Auth0UserProfile } from "auth0-js";
import history from "./History";
import autobind from "autobind-decorator";
import { getAccountInfo } from "../api/api";
import nanoid from "nanoid";

const CLIENT_ID: string = process.env.REACT_APP_AUTH0_CLIENT_ID!;
const DOMAIN: string = process.env.REACT_APP_AUTH0_DOMAIN!;

export default class Auth {
    private accessToken!: string | undefined;
    private idToken!: string | undefined;
    private expiresAt!: number;
    private userinfo!: Auth0UserProfile | undefined;
    private nonce: string;
    private handleEmailUpdate: (email: string | undefined) => void;
    private handleTokenUpdate: (token: string | undefined) => void;

    constructor(
        handleEmailUpdate: (email: string | undefined) => void,
        handleTokenUpdate: (token: string | undefined) => void
    ) {
        this.handleEmailUpdate = handleEmailUpdate;
        this.handleTokenUpdate = handleTokenUpdate;
        this.nonce = nanoid();
    }

    auth0 = new auth0.WebAuth({
        domain: DOMAIN,
        clientID: CLIENT_ID,
        redirectUri: window.location.origin + "/callback",
        responseType: "token id_token",
        scope: "openid profile email"
    });

    @autobind
    login() {
        this.auth0.authorize({ nonce: this.nonce });
    }

    @autobind
    handleAuthentication() {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                getAccountInfo(authResult.idToken)
                    .then(user => {
                        if (user && user.approval_date) {
                            this.setSession(authResult, "/");
                        } else {
                            history.replace("/register?unactivated=true");
                        }
                    })
                    .catch(error => {
                        history.replace("/register");
                    });
            } else if (err) {
                history.replace("/");
            }
        });
    }

    @autobind
    getAccessToken() {
        return this.accessToken;
    }

    @autobind
    getIdToken() {
        return this.idToken;
    }

    @autobind
    getEmail() {
        return this.userinfo!.email;
    }

    @autobind
    getExpiresAt() {
        return this.expiresAt;
    }

    @autobind
    setSession(authResult: Auth0DecodedHash, returnPath: string) {
        localStorage.setItem("isLoggedIn", "true");
        const expiresAt = authResult.idTokenPayload.exp * 1000;
        localStorage.setItem("expiresAt", String(expiresAt));
        this.accessToken = authResult.accessToken;
        this.idToken = authResult.idToken;
        this.expiresAt = expiresAt;
        this.handleTokenUpdate(this.idToken);
        this.auth0.client.userInfo(this.accessToken!, (err, userinfo) => {
            this.userinfo = userinfo;
            if (userinfo) {
                this.handleEmailUpdate(this.getEmail());
            }
        });

        history.replace(returnPath);
    }

    @autobind
    renewSession(returnPath: string) {
        this.auth0.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult, returnPath);
            } else if (err) {
                this.logout();
            }
        });
    }

    @autobind
    logout() {
        this.accessToken = undefined;
        this.idToken = undefined;
        this.expiresAt = 0;
        this.userinfo = undefined;

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("expiresAt");
        this.auth0.logout({
            clientID: CLIENT_ID,
            returnTo: window.location.origin
        });
    }

    @autobind
    isAuthenticated() {
        const expiresAt = this.getExpiresAt();
        return new Date().getTime() < expiresAt;
    }

    @autobind
    checkAuth(returnPath: string) {
        if (!this.isAuthenticated()) {
            if (localStorage.getItem("isLoggedIn") === "true") {
                this.renewSession(returnPath);
                return true;
            } else {
                this.login();
                return false;
            }
        }

        return true;
    }
}

export const AuthContext = React.createContext<Auth | undefined>(undefined);
