import * as React from "react";
import {
    TableCell,
    Button,
    FormControl,
    Select,
    MenuItem,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Fab
} from "@material-ui/core";
import autobind from "autobind-decorator";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import UserPermissionsDialog from "./UserPermissionsDialog";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import "./UserAccount.css";
import { updateRole, deleteUser, getUserEtag } from "../../api/api";

export default class UserTableRow extends React.Component<any, {}> {
    state = {
        role: this.props.account.role,
        roleDisabled: false,
        trialsDialogOpen: false,
        deleteDialogOpen: false
    };

    private openDeleteDialog() {
        this.setState({ deleteDialogOpen: true });
    }

    private openTrials() {
        this.setState({ trialsDialogOpen: true });
    }

    @autobind
    private handleRoleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({ role: event.target.value, roleDisabled: true });
        getUserEtag(this.props.token, this.props.account.id).then(results => {
            updateRole(
                this.props.token,
                this.props.account.id,
                results!,
                event.target.value
            ).then((result: any) => {
                this.setState({ roleDisabled: false });
                this.props.reloadUsers();
            });
        });
    }

    @autobind
    private handleTrialCancel() {
        this.setState({ trialsDialogOpen: false });
    }

    @autobind
    private handleDeleteCancel() {
        this.setState({ deleteDialogOpen: false });
    }

    @autobind
    private handleDeleteUser() {
        getUserEtag(this.props.token, this.props.account.id).then(results => {
            deleteUser(this.props.token, this.props.account.id, results!).then(
                result => {
                    this.props.reloadUsers();
                }
            );
        });
    }

    public render() {
        return (
            <>
                <TableCell className="Admin-row-text">
                    {this.props.account.email}
                </TableCell>
                <TableCell className="Admin-row-text">
                    {this.props.account.first_n} {this.props.account.last_n}
                </TableCell>
                <TableCell className="Admin-row-text">
                    {ORGANIZATION_NAME_MAP[this.props.account.organization]}
                </TableCell>
                <TableCell>
                    <FormControl
                        style={{ minWidth: 120, marginRight: 20 }}
                        disabled={this.state.roleDisabled}
                    >
                        <Select
                            value={this.state.role}
                            onChange={this.handleRoleChange}
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
                        disabled={!this.props.account.approval_date}
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => this.openTrials()}
                    >
                        Edit Data Access
                        <EditIcon style={{ marginLeft: 10 }} />
                    </Button>
                    <UserPermissionsDialog
                        open={this.state.trialsDialogOpen}
                        user={this.props.account}
                        token={this.props.token}
                        onCancel={this.handleTrialCancel}
                    />
                </TableCell>
                <TableCell>
                    <Fab
                        size="small"
                        color="secondary"
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => this.openDeleteDialog()}
                    >
                        <DeleteIcon />
                    </Fab>
                    <Dialog
                        open={this.state.deleteDialogOpen}
                        onClose={this.handleDeleteCancel}
                        fullWidth={true}
                        maxWidth="md"
                    >
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete the account of{" "}
                                {this.props.account.email}?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={this.handleDeleteCancel}
                                color="primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={this.handleDeleteUser}
                                color="primary"
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </TableCell>
            </>
        );
    }
}
