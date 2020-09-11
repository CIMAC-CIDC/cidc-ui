import * as React from "react";
import {
    TableCell,
    Button,
    FormControl,
    Select,
    MenuItem
} from "@material-ui/core";
import autobind from "autobind-decorator";
import EditIcon from "@material-ui/icons/Edit";
import UserPermissionsDialog from "./UserPermissionsDialog";
import { ORGANIZATION_NAME_MAP, ROLES } from "../../util/constants";
import { updateRole, getUserEtag } from "../../api/api";

export default class UserTableRow extends React.Component<any, {}> {
    state = {
        role: this.props.account.role,
        roleDisabled: false,
        trialsDialogOpen: false,
        deleteDialogOpen: false
    };

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

    public render() {
        return (
            <>
                <TableCell>{this.props.account.email}</TableCell>
                <TableCell>
                    {this.props.account.first_n} {this.props.account.last_n}
                </TableCell>
                <TableCell>
                    {ORGANIZATION_NAME_MAP[this.props.account.organization]}
                </TableCell>
                <TableCell>
                    <FormControl
                        style={{ minWidth: 120, marginRight: 20 }}
                        disabled={this.state.roleDisabled}
                    >
                        <Select
                            value={this.state.role}
                            onChange={(e: any) => this.handleRoleChange(e)}
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
                        grantee={this.props.account}
                        token={this.props.token}
                        onCancel={this.handleTrialCancel}
                    />
                </TableCell>
            </>
        );
    }
}
