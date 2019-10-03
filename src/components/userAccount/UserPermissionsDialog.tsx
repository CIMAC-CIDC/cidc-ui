import * as React from "react";
import {
    Dialog,
    CircularProgress,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    TableHead,
    FormControl,
    Checkbox
} from "@material-ui/core";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import autobind from "autobind-decorator";
import {
    getTrials,
    getPermissions,
    grantPermission,
    revokePermission
} from "../../api/api";
import { Trial } from "../../model/trial";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
import { InfoContext } from "../info/InfoProvider";

export interface IUserPermissionsDialogProps {
    open: boolean;
    user: Account;
    token: string;
    onCancel: () => void;
}

export interface IUserPermissionsDialogState {
    trials?: Trial[];
    permissions?: Permission[];
    page: number;
    rowsPerPage: number;
}

const UserPermissionsDialogWithInfo: React.FunctionComponent<
    IUserPermissionsDialogProps
> = props => {
    const { supportedTemplates, extraDataTypes } = React.useContext(
        InfoContext
    )!;

    const supportedTypes = [
        ...supportedTemplates.metadata,
        ...supportedTemplates.manifests,
        ...extraDataTypes
    ];

    return <UserPermissionsDialog {...props} supportedTypes={supportedTypes} />;
};

class UserPermissionsDialog extends React.Component<
    IUserPermissionsDialogProps & { supportedTypes: string[] },
    IUserPermissionsDialogState
> {
    state: IUserPermissionsDialogState = {
        trials: undefined,
        permissions: undefined,
        page: 0,
        rowsPerPage: 10
    };

    @autobind
    componentDidMount() {
        if (this.props.open) {
            this.setState({ trials: undefined });
            getTrials(this.props.token).then(trials =>
                this.setState({ trials })
            );
            this.refreshPermissions();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (!prevProps.open) {
            this.componentDidMount();
        }
    }

    @autobind
    refreshPermissions() {
        getPermissions(this.props.token).then(permissions => {
            this.setState({ permissions });
        });
    }

    @autobind
    private makeHandleChange(trial: string, assay: string) {
        return (e: React.ChangeEvent<HTMLInputElement>, deleteId?: number) => {
            const checked = e.currentTarget.checked;
            if (checked) {
                // Add temporary permission to state
                const tempNewPerm = { trial, assay_type: assay } as Permission;
                this.setState(({ permissions }) => ({
                    permissions: permissions
                        ? [...permissions, tempNewPerm]
                        : [tempNewPerm]
                }));

                // Refresh data from the API to get real update
                grantPermission(
                    this.props.token,
                    this.props.user,
                    trial,
                    assay
                ).then(() => this.refreshPermissions());
            } else if (!checked && deleteId) {
                // Fake a delete in local state
                this.setState(({ permissions }) => ({
                    permissions:
                        permissions &&
                        permissions.filter(
                            p => !(p.trial === trial && p.assay_type === assay)
                        )
                }));

                // Actually carry out the delete in the API
                revokePermission(this.props.token, deleteId).then(() =>
                    this.refreshPermissions()
                );
            }
        };
    }

    @autobind
    private handleCancel() {
        this.props.onCancel();
    }

    @autobind
    private handleChangePage(
        event: React.MouseEvent<HTMLButtonElement> | null,
        page: number
    ) {
        this.setState({ page });
    }

    @autobind
    private handleChangeRowsPerPage(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ rowsPerPage: Number(event.target.value) });
    }

    public render() {
        const userName = `${this.props.user.first_n} ${this.props.user.last_n}`;
        if (!this.state.permissions) {
            return null;
        }
        // Create a mapping from trial ID -> assay type -> permission
        const permissionsMap = mapValues(
            groupBy(this.state.permissions, p => p.trial),
            trialGroup =>
                trialGroup.reduce(
                    (acc, p) => ({ ...acc, [p.assay_type]: p }),
                    {}
                )
        );

        return (
            <>
                <Dialog open={this.props.open} onClose={this.handleCancel}>
                    <DialogTitle>
                        Editing data access for <strong>{userName}</strong>
                    </DialogTitle>
                    {!this.state.trials && (
                        <div className="User-account-progress">
                            <CircularProgress />
                        </div>
                    )}
                    <DialogContent>
                        {this.state.trials && (
                            <div>
                                <Table padding="checkbox">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Trial</TableCell>
                                            {this.props.supportedTypes.map(
                                                typ => (
                                                    <TableCell key={typ}>
                                                        {typ}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.trials
                                            .slice(
                                                this.state.page *
                                                    this.state.rowsPerPage,
                                                this.state.page *
                                                    this.state.rowsPerPage +
                                                    this.state.rowsPerPage
                                            )
                                            .map((trial: Trial) => (
                                                <TableRow key={trial.trial_id}>
                                                    <TableCell>
                                                        {trial.trial_id}
                                                    </TableCell>
                                                    {this.props.supportedTypes.map(
                                                        typ => {
                                                            return (
                                                                <AssayCheckbox
                                                                    key={
                                                                        typ +
                                                                        trial.trial_id
                                                                    }
                                                                    trialID={
                                                                        trial.trial_id
                                                                    }
                                                                    assayType={
                                                                        typ
                                                                    }
                                                                    permissionsMap={
                                                                        permissionsMap
                                                                    }
                                                                    onChange={this.makeHandleChange(
                                                                        trial.trial_id,
                                                                        typ
                                                                    )}
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[5, 10, 25]}
                                    count={this.state.trials.length}
                                    rowsPerPage={this.state.rowsPerPage}
                                    page={this.state.page}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={
                                        this.handleChangeRowsPerPage
                                    }
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

const AssayCheckbox: React.FunctionComponent<{
    trialID: string;
    assayType: string;
    permissionsMap: {
        [trial: string]: { [assay: string]: Permission };
    };
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        deleteId?: number
    ) => void;
}> = ({ trialID, assayType, permissionsMap, onChange }) => {
    const isChecked =
        trialID in permissionsMap && assayType in permissionsMap[trialID];

    const deleteId = isChecked
        ? permissionsMap[trialID][assayType].id
        : undefined;

    return (
        <TableCell>
            <FormControl>
                <Checkbox
                    data-testid={`checkbox-${trialID}-${assayType}`}
                    checked={isChecked}
                    onChange={e => onChange(e, deleteId)}
                />
            </FormControl>
        </TableCell>
    );
};

export default UserPermissionsDialogWithInfo;
