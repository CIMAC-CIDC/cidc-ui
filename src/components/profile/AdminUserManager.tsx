import * as React from "react";
import {
    Typography,
    TextField,
    Card,
    CardHeader,
    CardContent
} from "@material-ui/core";
import { getAllAccounts } from "../../api/api";
import { Account } from "../../model/account";
import AdminUserTableRow from "./AdminUserTableRow";
import { SupervisorAccount } from "@material-ui/icons";
import orderBy from "lodash/orderBy";
import PaginatedTable from "../generic/PaginatedTable";
import { useUserContext } from "../identity/UserProvider";
import { withIdToken } from "../identity/AuthProvider";

const ADMIN_TABLE_PAGE_SIZE = 15;

const AdminUserManager: React.FC<{ token: string }> = ({ token }) => {
    const user = useUserContext();
    const [users, setUsers] = React.useState<Account[] | undefined>();
    const [search, setSearch] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(0);

    const reloadUsers = React.useCallback(() => {
        getAllAccounts(token).then(fetchedUsers => {
            setUsers(
                fetchedUsers.filter(
                    fetchedUser =>
                        fetchedUser.role !== "system" &&
                        fetchedUser.id !== user.id
                )
            );
        });
    }, [user.id, token]);

    React.useEffect(() => {
        reloadUsers();
    }, [reloadUsers]);

    const filteredUsers = users?.filter((account: Account) => {
        if (search.length > 0) {
            return account.email.toLowerCase().includes(search.toLowerCase());
        }
        return true;
    });

    return (
        <Card>
            <CardHeader
                avatar={<SupervisorAccount />}
                title={<Typography variant="h6">Manage Users</Typography>}
            />
            <CardContent>
                <TextField
                    label="Search by email"
                    type="search"
                    variant="outlined"
                    margin="dense"
                    value={search}
                    onChange={e => setSearch(e.currentTarget.value)}
                />
                <PaginatedTable
                    data={
                        filteredUsers
                            ? orderBy(
                                  filteredUsers,
                                  a => `${a.first_n} ${a.last_n}`
                              ).slice(
                                  page * ADMIN_TABLE_PAGE_SIZE,
                                  (page + 1) * ADMIN_TABLE_PAGE_SIZE
                              )
                            : undefined
                    }
                    count={filteredUsers?.length || 0}
                    page={page}
                    rowsPerPage={ADMIN_TABLE_PAGE_SIZE}
                    onChangePage={p => setPage(p)}
                    getRowKey={u => u.id}
                    renderRowContents={u => (
                        <AdminUserTableRow user={u} reloadUsers={reloadUsers} />
                    )}
                />
            </CardContent>
        </Card>
    );
};

export default withIdToken(AdminUserManager);
