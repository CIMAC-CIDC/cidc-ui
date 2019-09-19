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
import Register from "./components/register/Register";
import Unactivated from "./components/register/Unactivated";
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
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={HomePage}
                                    />
                                    <Route
                                        path="/transfer-data"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={TransferDataPage}
                                        exact
                                    />
                                    <Route
                                        path="/transfer-data/cli-instructions"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={CliInstructions}
                                    />
                                    <Route
                                        path="/transfer-data/:assay"
                                        component={AssayInstructions}
                                    />
                                    <Route
                                        path="/browse-files"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={BrowseFilesPage}
                                    />
                                    <Route
                                        path="/templates"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={TemplatesPage}
                                    />
                                    <Route
                                        path="/privacy-security"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={PrivacyAndSecurityPage}
                                    />
                                    <Route
                                        path="/user-account"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={UserAccountPage}
                                    />
                                    <Route
                                        path="/file-details/:fileId"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={FileDetailsPage}
                                    />
                                    <Route
                                        path="/register"
                                        // tslint:disable-next-line:jsx-no-lambda
                                        component={Register}
                                    />
                                    <Route
                                        path="/unactivated"
                                        // tslint:disable-next-line:jsx-no-lambda
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
