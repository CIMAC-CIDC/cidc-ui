import * as React from "react";
import {
    TableCell,
    Button,
    FormControl,
    Select,
    MenuItem,
    Switch,
    Tooltip,
    makeStyles
} from "@material-ui/core";
import UserPermissionsDialog from "./AdminUserPermissionsDialog";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import { updateUser, getUserEtag } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";
import { Account } from "../../model/account";

const useStyles = makeStyles(theme => ({
    disabled: {
        color: theme.palette.text.secondary
    }
}));

export interface IAdminUserTableRowProps {
    user: Account;
    reloadUsers: () => void;
}

const IAdminUserTableRow: React.FC<IAdminUserTableRowProps & {
    token: string;
}> = ({ token, user: userProp, reloadUsers }) => {
    const [user, setUser] = React.useState<Account>(userProp);
    const [openPermsDialog, setOpenPermsDialog] = React.useState<boolean>(
        false
    );

    const classes = useStyles();
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
                <UserPermissionsDialog
                    open={openPermsDialog}
                    grantee={user}
                    token={token}
                    onCancel={() => setOpenPermsDialog(false)}
                />
            </TableCell>
        </>
    );
};

export default withIdToken<IAdminUserTableRowProps>(IAdminUserTableRow);
