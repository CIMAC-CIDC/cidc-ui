import * as React from "react";
import {
    Typography,
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
import orderBy from "lodash/orderBy";
import PaginatedTable from "../generic/PaginatedTable";

const ADMIN_TABLE_PAGE_SIZE = 15;

export interface IAdminMenuProps {
    token: string;
    userId: number;
}

export default class AdminMenu extends React.Component<IAdminMenuProps, {}> {
    state = {
        accounts: undefined,
        searchFilter: "",
        page: 0
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
                            <TextField
                                label="Search by email"
                                type="search"
                                variant="outlined"
                                margin="dense"
                                value={this.state.searchFilter}
                                onChange={this.handleSearchFilterChange}
                            />
                            <PaginatedTable
                                data={orderBy(
                                    accounts,
                                    a => `${a.first_n} ${a.last_n}`
                                ).slice(
                                    this.state.page * ADMIN_TABLE_PAGE_SIZE,
                                    (this.state.page + 1) *
                                        ADMIN_TABLE_PAGE_SIZE
                                )}
                                count={accounts.length}
                                page={this.state.page}
                                rowsPerPage={ADMIN_TABLE_PAGE_SIZE}
                                onChangePage={page => this.setState({ page })}
                                getRowKey={account => account.id}
                                renderRow={account => (
                                    <UserTableRow
                                        token={this.props.token}
                                        account={account}
                                        reloadUsers={this.reloadUsers}
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
}
