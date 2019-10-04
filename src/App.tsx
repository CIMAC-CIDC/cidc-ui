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
import Register from "./identity/Register";
import Unactivated from "./identity/Unactivated";
import history from "./identity/History";
import AssayInstructions from "./components/transferData/AssayInstructions";
import AuthProvider from "./identity/AuthProvider";
import UserProvider from "./identity/UserProvider";
import ErrorGuard from "./components/errors/ErrorGuard";
import InfoProvider from "./components/info/InfoProvider";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";

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
            selected: {
                color: "black"
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
                            </UserProvider>
                        </AuthProvider>
                    </ErrorGuard>
                </MuiThemeProvider>
            </div>
        </Router>
    );
}
