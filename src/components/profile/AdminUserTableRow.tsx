import * as React from "react";
import {
    TableCell,
    Button,
    FormControl,
    Select,
    MenuItem
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import UserPermissionsDialog from "./AdminUserPermissionsDialog";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import { updateRole, getUserEtag } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";
import { Account } from "../../model/account";

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

    const setRole = (role: string) => {
        getUserEtag(token, user.id).then(etag => {
            updateRole(token, user.id, etag, role).then(updatedUser => {
                setUser(updatedUser);
                reloadUsers();
            });
        });
    };

    return (
        <>
            <TableCell>{user.email}</TableCell>
            <TableCell>
                {user.first_n} {user.last_n}
            </TableCell>
            <TableCell>{ORGANIZATION_NAME_MAP[user.organization]}</TableCell>
            <TableCell>
                <FormControl
                    style={{ minWidth: 120, marginRight: 20 }}
                    disabled={user.disabled}
                >
                    <Select
                        value={user.role}
                        onChange={e => {
                            setRole(e.target.value as string);
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
                    <EditIcon style={{ marginLeft: 10 }} />
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
