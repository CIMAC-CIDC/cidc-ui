import * as React from "react";
import {
    Toolbar,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Grid
} from "@material-ui/core";
import "./UserAccount.css";
import { Account } from "../../model/account";
import { Trial } from "../../model/trial";
import { getAccountInfo, getTrials } from "../../api/api";
import autobind from "autobind-decorator";
import AdminMenu from "./AdminMenu";
import {
    LOCALE,
    DATE_OPTIONS,
    ORGANIZATION_NAME_MAP
} from "../../util/constants";

export interface IUserAccountPageState {
    accountInfo: Account | undefined;
    trials: Trial[] | undefined;
}

export default class UserAccountPage extends React.Component<
    any,
    IUserAccountPageState
> {
    state: IUserAccountPageState = {
        accountInfo: undefined,
        trials: undefined
    };

    componentDidMount() {
        if (this.props.token) {
            this.getUserData();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.token !== prevProps.token) {
            this.getUserData();
        }
    }

    @autobind
    private getUserData() {
        getAccountInfo(this.props.token).then(accountInfo => {
            this.setState({ accountInfo });
            getTrials(this.props.token).then(trials => {
                this.setState({ trials });
            });
        });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div>
                <Paper className="User-account-paper">
                    <Toolbar className="User-account-toolbar">
                        <Typography className="User-account-toolbar-text">
                            User Account
                        </Typography>
                    </Toolbar>
                    <div className="User-details">
                        {!this.state.accountInfo && !this.state.trials && (
                            <div className="User-account-progress">
                                <CircularProgress />
                            </div>
                        )}
                        {this.state.accountInfo && (
                            <div>
                                <Typography variant="h5">
                                    Registration Form and Code of Conduct:
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="textSecondary"
                                    paragraph
                                >
                                    {new Date(
                                        this.state.accountInfo._created
                                    ).toLocaleString(LOCALE, DATE_OPTIONS)}
                                </Typography>
                                <Typography variant="h5">
                                    Organization:
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="textSecondary"
                                    paragraph
                                >
                                    {
                                        ORGANIZATION_NAME_MAP[
                                            this.state.accountInfo.organization
                                        ]
                                    }
                                </Typography>
                            </div>
                        )}
                        {this.state.trials && (
                            <div>
                                {this.state.trials.length > 0 && (
                                    <div>
                                        <Typography variant="h5">
                                            Trials you are assigned to:
                                        </Typography>
                                        <Grid container spacing={8}>
                                            {this.state.trials.map(trial => {
                                                return (
                                                    <Grid
                                                        item
                                                        key={trial.trial_id}
                                                    >
                                                        <Chip
                                                            label={
                                                                trial.trial_id
                                                            }
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </div>
                                )}
                                {this.state.trials.length === 0 && (
                                    <Typography variant="h5">
                                        You are not assigned to any trials.
                                    </Typography>
                                )}
                            </div>
                        )}
                    </div>
                </Paper>
                {this.state.accountInfo &&
                    this.state.accountInfo.role === "cidc-admin" && (
                        <AdminMenu
                            token={this.props.token}
                            userId={this.state.accountInfo.id}
                        />
                    )}
            </div>
        );
    }
}
