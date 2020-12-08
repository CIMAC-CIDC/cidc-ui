import * as React from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardContent,
    makeStyles,
    TableCell,
    Tooltip,
    FormControl,
    MenuItem,
    Select,
    Switch,
    Button
} from "@material-ui/core";
import { getUserEtag, getUsers, updateUser } from "../../api/api";
import { Account } from "../../model/account";
import { SupervisorAccount } from "@material-ui/icons";
import PaginatedTable, { ISortConfig } from "../generic/PaginatedTable";
import { useUserContext } from "../identity/UserProvider";
import { withIdToken } from "../identity/AuthProvider";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import UserPermissionsDialogWithInfo from "./AdminUserPermissionsDialog";

const useRowStyles = makeStyles(theme => ({
    disabled: {
        color: theme.palette.text.secondary
    }
}));

interface IAdminUserTableRowProps {
    user: Account;
    reloadUsers: () => void;
}

const AdminUserTableRow: React.FC<IAdminUserTableRowProps> = withIdToken(
    ({ token, user: userProp, reloadUsers }) => {
        const [user, setUser] = React.useState<Account>(userProp);
        const [openPermsDialog, setOpenPermsDialog] = React.useState<boolean>(
            false
        );

        const classes = useRowStyles();
        const cellClass = user.disabled ? classes.disabled : undefined;

        const doUserUpdate = (updates: Parameters<typeof updateUser>[3]) => {
            getUserEtag(token, user.id).then(etag => {
                updateUser(token, user.id, etag, updates).then(updatedUser => {
                    setUser(updatedUser);
                    reloadUsers();
                });
            });
        };

        return (
            <>
                <TableCell>
                    <Tooltip
                        title={
                            user.disabled
                                ? "enable this account"
                                : "disable this account"
                        }
                    >
                        <Switch
                            size="small"
                            color="primary"
                            checked={!user.disabled}
                            onChange={() =>
                                doUserUpdate({ disabled: !user.disabled })
                            }
                        />
                    </Tooltip>
                </TableCell>
                <TableCell className={cellClass}>{user.email}</TableCell>
                <TableCell className={cellClass}>
                    {user.first_n} {user.last_n}
                </TableCell>
                <TableCell className={cellClass}>
                    {ORGANIZATION_NAME_MAP[user.organization]}
                </TableCell>
                <TableCell>
                    <FormControl
                        style={{ minWidth: 120, marginRight: 20 }}
                        disabled={user.disabled}
                    >
                        <Select
                            value={user.role || ""}
                            onChange={e => {
                                doUserUpdate({
                                    role: e.target.value as Account["role"]
                                });
                            }}
                        >
                            {ROLES.map(role => (
                                <MenuItem value={role} key={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={!user.approval_date}
                        onClick={() => setOpenPermsDialog(true)}
                    >
                        Edit Data Access
                    </Button>
                    <UserPermissionsDialogWithInfo
                        open={openPermsDialog}
                        grantee={user}
                        token={token}
                        onCancel={() => setOpenPermsDialog(false)}
                    />
                </TableCell>
            </>
        );
    }
);

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
