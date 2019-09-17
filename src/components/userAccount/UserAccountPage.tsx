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
import { getAccountInfo, getPermissions } from "../../api/api";
import autobind from "autobind-decorator";
import AdminMenu from "./AdminMenu";
import {
    LOCALE,
    DATE_OPTIONS,
    ORGANIZATION_NAME_MAP
} from "../../util/constants";
import Permission from "../../model/permission";
import Auth from "../../auth/Auth";
import { RouteComponentProps } from "react-router";
import ContactAnAdmin from "../generic/ContactAnAdmin";

export interface IUserAccountPageState {
    accountInfo: Account | undefined;
    permissions: Permission[] | undefined;
}

export interface IUserAccountPageProps extends RouteComponentProps {
    token: string;
    auth: Auth;
}

export default class UserAccountPage extends React.Component<
    IUserAccountPageProps,
    IUserAccountPageState
> {
    state: IUserAccountPageState = {
        accountInfo: undefined,
        permissions: undefined
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
            getPermissions(this.props.token).then(permissions => {
                this.setState({ accountInfo, permissions });
            });
        });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        const isAdmin =
            this.state.accountInfo &&
            this.state.accountInfo.role === "cidc-admin";
        const hasPerms =
            this.state.permissions && this.state.permissions.length > 0;

        return (
            <div>
                <Paper className="User-account-paper">
                    <Toolbar className="User-account-toolbar">
                        <Typography className="User-account-toolbar-text">
                            User Account
                        </Typography>
                    </Toolbar>
                    <div className="User-details">
                        {!this.state.accountInfo && !this.state.permissions && (
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
                        {this.state.permissions && (
                            <div>
                                <div>
                                    <Typography variant="h5">
                                        Dataset Access:
                                    </Typography>
                                    <Grid container spacing={8}>
                                        {isAdmin ? (
                                            <Grid item>
                                                <Typography
                                                    variant="h5"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    As an admin, you have access
                                                    to all datasets.
                                                </Typography>
                                            </Grid>
                                        ) : hasPerms ? (
                                            this.state.permissions.map(perm => {
                                                return (
                                                    <Grid
                                                        item
                                                        key={
                                                            perm.trial +
                                                            perm.assay_type
                                                        }
                                                    >
                                                        <Chip
                                                            label={`${
                                                                perm.trial
                                                            }: ${
                                                                perm.assay_type
                                                            }`}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item>
                                                <Typography
                                                    variant="h5"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    You do not have access to
                                                    any datasets.{" "}
                                                    <ContactAnAdmin /> if you
                                                    believe this is a mistake.
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </div>
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
