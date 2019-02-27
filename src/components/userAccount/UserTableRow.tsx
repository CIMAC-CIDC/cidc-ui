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
import SaveIcon from "@material-ui/icons/Save";
import UserTrialsDialog from "./UserTrialsDialog";
import { ORGANIZATION_NAME_MAP } from "../../util/Constants";
import "./UserAccount.css";
import { updateRole, deleteUser } from "../../api/api";

export default class AdminMenu extends React.Component<any, {}> {
    state = {
        role: this.props.account.role,
        saveDisabled: true,
        trialsDialogOpen: false,
        deleteDialogOpen: false
    };

    private openDeleteDialog() {
        this.setState({ deleteDialogOpen: true });
    }

    private handleSave() {
        updateRole(
            this.props.token,
            this.props.account._id,
            this.props.account._etag,
            this.state.role
        ).then(results => {
            this.setState({ saveDisabled: true });
        });
    }

    private openTrials() {
        this.setState({ trialsDialogOpen: true });
    }

    @autobind
    private handleRoleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        let saveDisabled = false;
        if (event.target.value === this.props.account.role) {
            saveDisabled = true;
        }
        this.setState({ role: event.target.value, saveDisabled });
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
        deleteUser(
            this.props.token,
            this.props.account._id,
            this.props.account._etag
        ).then(results => {
            this.props.reloadUsers();
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
                    <FormControl style={{ minWidth: 120, marginRight: 20 }}>
                        <Select
                            value={this.state.role}
                            onChange={this.handleRoleChange}
                        >
                            {this.props.account.role === "registrant" && (
                                <MenuItem value="registrant">
                                    Registrant
                                </MenuItem>
                            )}
                            <MenuItem value="reader">Reader</MenuItem>
                            <MenuItem value="uploader">Uploader</MenuItem>
                            <MenuItem value="lead">Lead</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="developer">Developer</MenuItem>
                            <MenuItem value="disabled">Disabled</MenuItem>
                        </Select>
                    </FormControl>
                    <Fab
                        size="small"
                        color="primary"
                        disabled={this.state.saveDisabled}
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => this.handleSave()}
                    >
                        <SaveIcon />
                    </Fab>
                </TableCell>
                <TableCell>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => this.openTrials()}
                    >
                        Edit Trials
                        <EditIcon style={{ marginLeft: 10 }} />
                    </Button>
                    <UserTrialsDialog
                        open={this.state.trialsDialogOpen}
                        account={this.props.account}
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
