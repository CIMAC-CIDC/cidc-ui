import * as React from "react";
import BrowseDataPage from "./components/browse-data/BrowseDataPage";
import FileDetailsPage from "./components/browse-data/files/FileDetailsPage";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/home/HomePage";
import ManifestsPage from "./components/manifests/ManifestsPage";
import PrivacyAndSecurityPage from "./components/privacy-and-security/PrivacyAndSecurityPage";
import ProfilePage from "./components/profile/ProfilePage";
import Register from "./components/identity/Register";
import Unactivated from "./components/identity/Unactivated";
import history from "./components/identity/History";
import ErrorGuard from "./components/errors/ErrorGuard";
import InfoProvider from "./components/info/InfoProvider";
import { CIDCThemeProvider, useRootStyles } from "./rootStyles";
import { QueryParamProvider } from "use-query-params";
import {
    AssayDocsPage,
    AnalysesDocsPage
} from "./components/upload-docs/UploadDocsPages";
import SchemaPage from "./components/schema/SchemaPage";
import PipelinesPage from "./components/pipelines/PipelinesPage";
import NotFoundRoute from "./components/generic/NotFoundRoute";
import IdentityProvider from "./components/identity/IdentityProvider";

export default function App() {
    const classes = useRootStyles();

    return (
        <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <div className={classes.root}>
                    <CIDCThemeProvider>
                        <ErrorGuard>
                            <InfoProvider>
                                <IdentityProvider>
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
                                                path="/browse-data/:fileId"
                                                component={FileDetailsPage}
                                            />
                                            <Route
                                                exact
                                                path="/browse-data"
                                                component={BrowseDataPage}
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
                                                component={ProfilePage}
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
                                </IdentityProvider>
                            </InfoProvider>
                        </ErrorGuard>
                    </CIDCThemeProvider>
                </div>
            </QueryParamProvider>
        </Router>
    );
}
