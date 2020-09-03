import * as React from "react";
import BrowseFilesPage from "./components/browseFiles/BrowseFilesPage";
import FileDetailsPage from "./components/browseFiles/FileDetailsPage";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/home/HomePage";
import ManifestsPage from "./components/manifests/ManifestsPage";
import PrivacyAndSecurityPage from "./components/privacyAndSecurity/PrivacyAndSecurityPage";
import UserAccountPage from "./components/userAccount/UserAccountPage";
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
} from "./components/uploadDocs/UploadDocsPages";
import TrialsPage from "./components/trials/TrialsPage";
import SchemaPage from "./components/schema/SchemaPage";
import PipelinesPage from "./components/pipelines/PipelinesPage";

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
                                                    path="/"
                                                    exact={true}
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
                                                    path="/browse-files/:fileId"
                                                    component={FileDetailsPage}
                                                />
                                                <Route
                                                    path="/browse-files"
                                                    component={BrowseFilesPage}
                                                />
                                                <Route
                                                    path="/manifests"
                                                    component={ManifestsPage}
                                                />
                                                <Route
                                                    path="/trials"
                                                    component={TrialsPage}
                                                />
                                                <Route
                                                    path="/pipelines"
                                                    component={PipelinesPage}
                                                />
                                                <Route
                                                    path="/schema"
                                                    component={SchemaPage}
                                                />
                                                <Route
                                                    path="/privacy-security"
                                                    component={
                                                        PrivacyAndSecurityPage
                                                    }
                                                />
                                                <Route
                                                    path="/user-account"
                                                    component={UserAccountPage}
                                                />
                                                <Route
                                                    path="/register"
                                                    component={Register}
                                                />
                                                <Route
                                                    path="/unactivated"
                                                    component={Unactivated}
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
