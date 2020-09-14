import * as React from "react";
import BrowseFilesPage from "./components/browse-files/BrowseFilesPage";
import FileDetailsPage from "./components/browse-files/FileDetailsPage";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/home/HomePage";
import ManifestsPage from "./components/manifests/ManifestsPage";
import PrivacyAndSecurityPage from "./components/privacy-and-security/PrivacyAndSecurityPage";
import UserAccountPage from "./components/profile/UserAccountPage";
import Register from "./components/identity/Register";
import Unactivated from "./components/identity/Unactivated";
import history from "./components/identity/History";
import AuthProvider from "./components/identity/AuthProvider";
import UserProvider from "./components/identity/UserProvider";
import ErrorGuard from "./components/errors/ErrorGuard";
import InfoProvider from "./components/info/InfoProvider";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { useRootStyles } from "./rootStyles";
import { QueryParamProvider } from "use-query-params";
import {
    AssayDocsPage,
    AnalysesDocsPage
} from "./components/upload-docs/UploadDocsPages";
import SchemaPage from "./components/schema/SchemaPage";
import PipelinesPage from "./components/pipelines/PipelinesPage";
import NotFoundRoute from "./components/generic/NotFoundRoute";

export const theme = createMuiTheme({
    overrides: {
        MuiCard: {
            root: {
                boxShadow: "none",
                border: "1px solid #cfd0d0",
                borderRadius: 5
            }
        },
        MuiTab: {
            root: {
                "&$selected": {
                    color: "black"
                }
            }
        }
    }
});

export default function App() {
    const classes = useRootStyles();

    return (
        <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <div className={classes.root}>
                    <MuiThemeProvider theme={theme}>
                        <ErrorGuard>
                            <AuthProvider>
                                <InfoProvider>
                                    <UserProvider>
                                        <Header />
                                        <div className={classes.content}>
                                            <Switch>
                                                <Route
                                                    exact
                                                    path="/"
                                                    component={HomePage}
                                                />
                                                <Route
                                                    path="/assays"
                                                    component={AssayDocsPage}
                                                />
                                                <Route
                                                    path="/analyses"
                                                    component={AnalysesDocsPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/browse-files/:fileId"
                                                    component={FileDetailsPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/browse-files"
                                                    component={BrowseFilesPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/manifests"
                                                    component={ManifestsPage}
                                                />
                                                <Route
                                                    path="/pipelines"
                                                    component={PipelinesPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/schema"
                                                    component={SchemaPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/privacy-security"
                                                    component={
                                                        PrivacyAndSecurityPage
                                                    }
                                                />
                                                <Route
                                                    exact
                                                    path="/profile"
                                                    component={UserAccountPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/register"
                                                    component={Register}
                                                />
                                                <Route
                                                    exact
                                                    path="/unactivated"
                                                    component={Unactivated}
                                                />
                                                <Route
                                                    path="*"
                                                    component={NotFoundRoute}
                                                />
                                            </Switch>
                                        </div>
                                        <Footer />
                                    </UserProvider>
                                </InfoProvider>
                            </AuthProvider>
                        </ErrorGuard>
                    </MuiThemeProvider>
                </div>
            </QueryParamProvider>
        </Router>
    );
}
