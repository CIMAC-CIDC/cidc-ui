import * as React from "react";
import {
    Typography,
    Table,
    TableBody,
    TableRow,
    TablePagination,
    TextField,
    Card,
    CardHeader,
    CardContent
} from "@material-ui/core";
import { getAllAccounts } from "../../api/api";
import autobind from "autobind-decorator";
import { Account } from "../../model/account";
import UserTableRow from "./UserTableRow";
import { List } from "@material-ui/icons";

export interface IAdminMenuProps {
    token: string;
    userId: number;
}

export default class AdminMenu extends React.Component<IAdminMenuProps, {}> {
    state = {
        accounts: undefined,
        page: 0,
        rowsPerPage: 10,
        searchFilter: ""
    };

    componentDidMount() {
        this.reloadUsers();
    }

    @autobind
    private reloadUsers() {
        getAllAccounts(this.props.token).then(results => {
            this.setState({
                accounts: results!.filter(
                    account =>
                        account.role !== "system" &&
                        account.id !== this.props.userId
                )
            });
        });
    }

    @autobind
    private handleChangePage(
        event: React.MouseEvent<HTMLButtonElement> | null,
        page: number
    ) {
        this.setState({ page });
    }

    @autobind
    private handleChangeRowsPerPage(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ rowsPerPage: Number(event.target.value) });
    }

    @autobind
    private handleSearchFilterChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ searchFilter: event.target.value });
    }

    private filterAccounts(
        accounts: Account[] | undefined,
        searchFilter: string
    ): Account[] | undefined {
        if (!accounts) {
            return undefined;
        }

        return accounts.filter((account: Account) => {
            if (searchFilter.length > 0) {
                return account.email
                    .toLowerCase()
                    .includes(searchFilter.toLowerCase());
            }
            return true;
        });
    }

    public render() {
        const accounts = this.filterAccounts(
            this.state.accounts,
            this.state.searchFilter
        );
        return (
            <div style={{ marginTop: 20 }}>
                {accounts && (
                    <Card>
                        <CardHeader
                            avatar={<List />}
                            title={
                                <Typography variant="h6">
                                    Admin Tasks
                                </Typography>
                            }
                        />
                        <CardContent>
                            <div className="Email-search">
                                <TextField
                                    label="Search by email"
                                    type="search"
                                    margin="normal"
                                    variant="outlined"
                                    value={this.state.searchFilter}
                                    className="File-search"
                                    InputProps={{
                                        className: "File-search-input"
                                    }}
                                    InputLabelProps={{
                                        className: "File-search-label"
                                    }}
                                    onChange={this.handleSearchFilterChange}
                                />
                            </div>
                            <Table>
                                <TableBody>
                                    {accounts
                                        .slice(
                                            this.state.page *
                                                this.state.rowsPerPage,
                                            this.state.page *
                                                this.state.rowsPerPage +
                                                this.state.rowsPerPage
                                        )
                                        .map((account: Account) => {
                                            return (
                                                <TableRow key={account.id}>
                                                    <UserTableRow
                                                        token={this.props.token}
                                                        account={account}
                                                        reloadUsers={
                                                            this.reloadUsers
                                                        }
                                                    />
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[5, 10, 25]}
                                count={accounts.length}
                                rowsPerPage={this.state.rowsPerPage}
                                page={this.state.page}
                                onChangePage={this.handleChangePage}
                                onChangeRowsPerPage={
                                    this.handleChangeRowsPerPage
                                }
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
}
