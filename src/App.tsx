import * as React from "react";
import "./App.css";
import BrowseFilesPage from "./components/browseFiles/BrowseFilesPage";
import FileDetailsPage from "./components/browseFiles/FileDetailsPage";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/home/HomePage";
import TransferDataPage from "./components/assays/AssaysPage";
import CliInstructions from "./components/assays/CliInstructions";
import ManifestsPage from "./components/manifests/ManifestsPage";
import PrivacyAndSecurityPage from "./components/privacyAndSecurity/PrivacyAndSecurityPage";
import UserAccountPage from "./components/userAccount/UserAccountPage";
import Register from "./components/identity/Register";
import Unactivated from "./components/identity/Unactivated";
import history from "./components/identity/History";
import AssayInstructions from "./components/assays/AssayInstructions";
import AuthProvider from "./components/identity/AuthProvider";
import UserProvider from "./components/identity/UserProvider";
import ErrorGuard from "./components/errors/ErrorGuard";
import InfoProvider from "./components/info/InfoProvider";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import DataProvider from "./components/data/DataProvider";

const theme = createMuiTheme({
    overrides: {
        MuiCard: {
            root: {
                boxShadow: "none",
                border: "1px solid #cfd0d0",
                borderRadius: 5,
                overflowX: "scroll"
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
    return (
        <Router history={history}>
            <div className="App">
                <MuiThemeProvider theme={theme}>
                    <ErrorGuard>
                        <AuthProvider>
                            <UserProvider>
                                <DataProvider>
                                    <InfoProvider>
                                        <Header />
                                        <div className="Content">
                                            <Switch>
                                                <Route
                                                    path="/"
                                                    exact={true}
                                                    component={HomePage}
                                                />
                                                <Route
                                                    path="/assays"
                                                    component={TransferDataPage}
                                                    exact
                                                />
                                                <Route
                                                    path="/assays/cli-instructions"
                                                    component={CliInstructions}
                                                />
                                                <Route
                                                    path="/assays/:assay"
                                                    component={
                                                        AssayInstructions
                                                    }
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
                                    </InfoProvider>
                                </DataProvider>
                            </UserProvider>
                        </AuthProvider>
                    </ErrorGuard>
                </MuiThemeProvider>
            </div>
        </Router>
    );
}
