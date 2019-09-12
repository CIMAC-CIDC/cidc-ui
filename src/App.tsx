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
import Auth, { AuthContext } from "./auth/Auth";
import history from "./auth/History";
import autobind from "autobind-decorator";
import IdleTimer from "react-idle-timer";
import Loader from "./components/generic/Loader";
import AssayInstructions from "./components/transferData/AssayInstructions";

const IDLE_TIMEOUT: number = 1000 * 60 * 15;

class App extends React.Component<any, any> {
    state = {
        email: "",
        token: ""
    };

    constructor(props: any) {
        super(props);
        const expiresAt = Number(localStorage.getItem("expiresAt"));
        if (expiresAt > 0 && new Date().getTime() >= expiresAt) {
            this.auth.logout();
        }
    }

    private auth = new Auth(this.handleEmailUpdate, this.handleTokenUpdate);

    @autobind
    handleAuthentication(props: any) {
        if (/access_token|id_token|error/.test(props.location.hash)) {
            this.auth.handleAuthentication(props);
        }
    }

    @autobind
    handleEmailUpdate(email: string | undefined) {
        this.setState({ email });
    }

    @autobind
    handleTokenUpdate(token: string | undefined) {
        this.setState({ token });
    }

    @autobind
    handleIdle() {
        this.auth.logout();
    }

    public render() {
        return (
            <AuthContext.Provider value={this.auth}>
                <Router history={history}>
                    <div className="App">
                        <IdleTimer
                            ref={() => null}
                            onIdle={this.handleIdle}
                            timeout={IDLE_TIMEOUT}
                        />
                        <Header auth={this.auth} email={this.state.email} />
                        <div className="Content">
                            <Switch>
                                <Route
                                    path="/"
                                    exact={true}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <HomePage auth={this.auth} {...props} />
                                    )}
                                />
                                <Route
                                    path="/transfer-data"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <TransferDataPage
                                            auth={this.auth}
                                            {...props}
                                        />
                                    )}
                                    exact
                                />
                                <Route
                                    path="/transfer-data/cli-instructions"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <CliInstructions
                                            auth={this.auth}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/transfer-data/:assay"
                                    render={props => (
                                        <AssayInstructions
                                            token={this.auth.getIdToken()}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/browse-files"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <BrowseFilesPage
                                            auth={this.auth}
                                            token={this.state.token}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/templates"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <TemplatesPage {...props} />
                                    )}
                                />
                                <Route
                                    path="/privacy-security"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <PrivacyAndSecurityPage
                                            auth={this.auth}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/user-account"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <UserAccountPage
                                            auth={this.auth}
                                            token={this.state.token}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/file-details/:fileId"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <FileDetailsPage
                                            auth={this.auth}
                                            token={this.state.token}
                                            {...props}
                                        />
                                    )}
                                />
                                <Route
                                    path="/register"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => (
                                        <Register auth={this.auth} {...props} />
                                    )}
                                />
                                <Route
                                    path="/callback"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    render={props => {
                                        this.handleAuthentication(props);
                                        return <Loader />;
                                    }}
                                />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </Router>
            </AuthContext.Provider>
        );
    }
}

export default App;
