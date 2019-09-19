import * as React from "react";
import "./App.css";
import BrowseFilesPage from "./components/browseFiles/BrowseFilesPage";
import FileDetailsPage from "./components/browseFiles/FileDetailsPage";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/home/HomePage";
import TransferDataPage from "./components/transferData/TransferDataPage";
import CliInstructions from "./components/transferData/CliInstructions";
import TemplatesPage from "./components/templates/TemplatesPage";
import PrivacyAndSecurityPage from "./components/privacyAndSecurity/PrivacyAndSecurityPage";
import UserAccountPage from "./components/userAccount/UserAccountPage";
import Register from "./auth/Register";
import Unactivated from "./auth/Unactivated";
import history from "./auth/History";
import AssayInstructions from "./components/transferData/AssayInstructions";
import AuthProvider from "./auth/AuthProvider";
import UserProvider from "./auth/UserProvider";
import NetworkErrorGaurd from "./components/errors/NetworkErrorGuard";

export default function App() {
    return (
        <Router history={history}>
            <div className="App">
                <NetworkErrorGaurd>
                    <AuthProvider>
                        <UserProvider>
                            <Header />
                            <div className="Content">
                                <Switch>
                                    <Route
                                        path="/"
                                        exact={true}
                                        component={HomePage}
                                    />
                                    <Route
                                        path="/transfer-data"
                                        component={TransferDataPage}
                                        exact
                                    />
                                    <Route
                                        path="/transfer-data/cli-instructions"
                                        component={CliInstructions}
                                    />
                                    <Route
                                        path="/transfer-data/:assay"
                                        component={AssayInstructions}
                                    />
                                    <Route
                                        path="/browse-files"
                                        component={BrowseFilesPage}
                                    />
                                    <Route
                                        path="/templates"
                                        component={TemplatesPage}
                                    />
                                    <Route
                                        path="/privacy-security"
                                        component={PrivacyAndSecurityPage}
                                    />
                                    <Route
                                        path="/user-account"
                                        component={UserAccountPage}
                                    />
                                    <Route
                                        path="/file-details/:fileId"
                                        component={FileDetailsPage}
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
                    </AuthProvider>
                </NetworkErrorGaurd>
            </div>
        </Router>
    );
}
