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
    Button,
    TextField,
    Box,
    IconButton,
    Grid
} from "@material-ui/core";
import { apiFetch, IApiPage } from "../../api/api";
import { Account } from "../../model/account";
import { CloudDownload, Edit, SupervisorAccount } from "@material-ui/icons";
import PaginatedTable, { ISortConfig } from "../generic/PaginatedTable";
import { useUserContext } from "../identity/UserProvider";
import { withIdToken } from "../identity/AuthProvider";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import UserPermissionsDialogWithInfo from "./AdminUserPermissionsDialog";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { formatQueryString } from "../../util/formatters";
import { apiUpdate } from "../../api/api";
import moment from "moment";
import Loader from "../generic/Loader";

const useContactEmailStyles = makeStyles(theme => ({
    input: {
        fontSize: theme.typography.subtitle2.fontSize,
        width: 200
    }
}));

const ContactEmail: React.FC<{
    user: Account;
    onSave: (newContactEmail: string) => void;
}> = ({ user, onSave }) => {
    const classes = useContactEmailStyles();
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const { register, handleSubmit } = useForm<{ contactEmail: string }>();
    return (
        <Box>
            {isEditing ? (
                <form
                    onSubmit={handleSubmit(({ contactEmail }) => {
                        if (contactEmail) {
                            onSave(contactEmail);
                        }
                        setIsEditing(false);
                    })}
                >
                    <TextField
                        autoFocus
                        inputRef={register}
                        inputProps={{
                            name: "contactEmail",
                            defaultValue: user.contact_email
                        }}
                        InputProps={{ className: classes.input }}
                        placeholder="Add a contact email"
                        variant="outlined"
                        size="small"
                    />
                    <Grid container wrap="nowrap" alignItems="center">
                        <Grid item>
                            <Button size="small" color="primary" type="submit">
                                update
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                onClick={() => setIsEditing(false)}
                            >
                                cancel
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            ) : (
                <div>
                    {user.contact_email ? (
                        <Grid
                            container
                            spacing={1}
                            wrap="nowrap"
                            alignItems="center"
                        >
                            <Grid item>{user.contact_email}</Grid>
                            <Grid item>
                                <Tooltip title="edit contact email">
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    ) : (
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => setIsEditing(true)}
                        >
                            add a contact email
                        </Button>
                    )}
                </div>
            )}
        </Box>
    );
};

const DataAccessReportDownloadButton: React.FC = withIdToken(({ token }) => {
    const [isDownloading, setIsDownloading] = React.useState<boolean>(false);

    const downloadDataAccessReport = () => {
        setIsDownloading(true);
        apiFetch<ArrayBuffer>("/users/data_access_report", token, {
            responseType: "arraybuffer"
        }).then(data => {
            const blob = new Blob([data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const date = moment().format("YYYY-MM-DD");
            a.href = url;
            a.download = `cidc_${process.env.REACT_APP_ENV}_data_access_${date}.xlsx`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            setIsDownloading(false);
        });
    };

    return (
        <Button
            variant="outlined"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={() => downloadDataAccessReport()}
            disabled={isDownloading}
        >
            <Grid container spacing={1} alignItems="center" wrap="nowrap">
                <Grid item>Download Data Access Report</Grid>

                <Grid item>{isDownloading && <Loader size="1rem" />}</Grid>
            </Grid>
        </Button>
    );
});

const useRowStyles = makeStyles(theme => ({
    disabled: {
        color: theme.palette.text.secondary
    }
}));

interface IAdminUserTableRowProps {
    user: Account;
    onUpdatedUser: (user: Account) => void;
}

const AdminUserTableRow: React.FC<IAdminUserTableRowProps> = withIdToken(
    ({ token, user, onUpdatedUser }) => {
        const [openPermsDialog, setOpenPermsDialog] = React.useState<boolean>(
            false
        );

        const classes = useRowStyles();
        const cellClass = user.disabled ? classes.disabled : undefined;

        const doUserUpdate = (updates: Partial<Account>) => {
            apiUpdate<Account>(`/users/${user.id}`, token, {
                etag: user._etag,
                data: updates
            }).then(updatedUser => onUpdatedUser(updatedUser));
        };

        return (
            <>
                <TableCell className={cellClass}>{user.email}</TableCell>
                <TableCell className={cellClass}>
                    {user.first_n} {user.last_n}
                </TableCell>
                <TableCell className={cellClass}>
                    {ORGANIZATION_NAME_MAP[user.organization]}
                </TableCell>
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
                <TableCell>
                    <ContactEmail
                        user={user}
                        onSave={contactEmail =>
                            doUserUpdate({ contact_email: contactEmail })
                        }
                    />
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
    const [page, setPage] = React.useState<number>(0);
    const [sortConfig, setSortConfig] = React.useState<
        Omit<ISortConfig, "onSortChange">
    >({ key: "email", direction: "desc" });

    const { data, mutate } = useSWR<IApiPage<Account>>([
        `/users?${formatQueryString({
            page_num: page,
            page_size: ADMIN_TABLE_PAGE_SIZE,
            sort_field: sortConfig.key,
            sort_direction: sortConfig.direction
        })}`,
        token
    ]);
    const users = data?._items.filter(
        fetchedUser =>
            fetchedUser.role !== "system" && fetchedUser.id !== user.id
    );

    return (
        <Card>
            <CardHeader
                avatar={<SupervisorAccount />}
                title={
                    <Grid container justify="space-between" alignItems="center">
                        <Typography variant="h6">Manage Users</Typography>
                        <Grid item></Grid>
                        <Grid item>
                            <DataAccessReportDownloadButton />
                        </Grid>
                    </Grid>
                }
            />
            <CardContent>
                <PaginatedTable
                    sortConfig={{
                        ...sortConfig,
                        onSortChange: (key, direction) =>
                            setSortConfig({ key, direction })
                    }}
                    headers={[
                        { key: "email", label: "Email" },
                        { key: "first_n", label: "Name" },
                        { key: "organization", label: "Organization" },
                        { key: "disabled", label: "Enabled?" },
                        { key: "contact_email", label: "Contact Email" },
                        { key: "role", label: "Role" },
                        { key: "", label: "Permissions" }
                    ]}
                    data={users}
                    count={data?._meta.total || 0}
                    page={page}
                    rowsPerPage={ADMIN_TABLE_PAGE_SIZE}
                    onChangePage={p => setPage(p)}
                    getRowKey={u => u.id}
                    renderRowContents={u => (
                        <AdminUserTableRow
                            user={u}
                            onUpdatedUser={updatedUser => {
                                if (data) {
                                    mutate({
                                        _meta: data._meta,
                                        _items: data._items.map(otherUser => {
                                            return otherUser.id ===
                                                updatedUser.id
                                                ? updatedUser
                                                : otherUser;
                                        })
                                    });
                                }
                            }}
                        />
                    )}
                />
            </CardContent>
        </Card>
    );
};

export default withIdToken(AdminUserManager);
