import * as React from "react";
import { Typography, Card, CardHeader, CardContent } from "@material-ui/core";
import { getUsers } from "../../api/api";
import { Account } from "../../model/account";
import AdminUserTableRow from "./AdminUserTableRow";
import { SupervisorAccount } from "@material-ui/icons";
import PaginatedTable, { ISortConfig } from "../generic/PaginatedTable";
import { useUserContext } from "../identity/UserProvider";
import { withIdToken } from "../identity/AuthProvider";

const ADMIN_TABLE_PAGE_SIZE = 15;

const AdminUserManager: React.FC<{ token: string }> = ({ token }) => {
    const user = useUserContext();
    const [users, setUsers] = React.useState<Account[] | undefined>();
    const [total, setTotal] = React.useState<number>(0);
    const [page, setPage] = React.useState<number>(0);
    const [sortConfig, setSortConfig] = React.useState<
        Omit<ISortConfig, "onSortChange">
    >({ key: "email", direction: "desc" });

    const reloadUsers = React.useCallback(() => {
        getUsers(token, {
            page_num: page,
            page_size: ADMIN_TABLE_PAGE_SIZE,
            sort_field: sortConfig.key,
            sort_direction: sortConfig.direction
        }).then(({ data, meta }) => {
            // Remove the current user from the user list
            // and the total user count.
            setUsers(
                data.filter(
                    fetchedUser =>
                        fetchedUser.role !== "system" &&
                        fetchedUser.id !== user.id
                )
            );
            setTotal(meta.total - 1);
        });
    }, [user.id, token, page, sortConfig]);

    React.useEffect(() => {
        reloadUsers();
    }, [reloadUsers]);

    return (
        <Card>
            <CardHeader
                avatar={<SupervisorAccount />}
                title={<Typography variant="h6">Manage Users</Typography>}
            />
            <CardContent>
                <PaginatedTable
                    sortConfig={{
                        ...sortConfig,
                        onSortChange: (key, direction) =>
                            setSortConfig({ key, direction })
                    }}
                    headers={[
                        { key: "disabled", label: "Enabled?" },
                        { key: "email", label: "Email" },
                        { key: "first_n", label: "Name" },
                        { key: "organization", label: "Organization" },
                        { key: "role", label: "Role" },
                        { key: "", label: "Permissions" }
                    ]}
                    data={users}
                    count={total}
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
