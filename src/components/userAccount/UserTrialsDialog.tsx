import * as React from "react";
import {
    Dialog,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TablePagination
} from "@material-ui/core";
import autobind from "autobind-decorator";
import { getTrials, updateTrial } from "../../api/api";
import { Trial } from "../../model/trial";

export interface IUserTrialsDialogState {
    trials: Trial[] | undefined;
    page: number;
    rowsPerPage: number;
}

export default class UserTrialsDialog extends React.Component<
    any,
    IUserTrialsDialogState
> {
    state: IUserTrialsDialogState = {
        trials: undefined,
        page: 0,
        rowsPerPage: 10
    };

    componentDidUpdate(prevProps: any) {
        if (this.props.open && !prevProps.open) {
            this.setState({ trials: undefined });
            getTrials(this.props.token).then(results => {
                this.setState({ trials: results });
            });
        }
    }

    @autobind
    private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newTrials: Trial[] = JSON.parse(
            JSON.stringify(this.state.trials)
        );
        newTrials.forEach((trial: Trial) => {
            if (trial._id === event.target.value) {
                if (trial.collaborators.includes(this.props.account.email)) {
                    trial.collaborators.splice(
                        trial.collaborators.indexOf(this.props.account.email),
                        1
                    );
                } else {
                    trial.collaborators.push(this.props.account.email);
                }
            }
        });

        this.setState({ trials: newTrials });
    }

    @autobind
    private handleCancel() {
        this.props.onCancel();
    }

    @autobind
    private handleSave() {
        let updatedTrialCount: number = 0;
        this.state.trials!.forEach((trial: Trial) => {
            updateTrial(
                this.props.token,
                trial._id,
                trial._etag,
                trial.collaborators
            ).then(results => {
                updatedTrialCount++;
                if (this.state.trials!.length === updatedTrialCount) {
                    this.props.onCancel();
                }
            });
        });
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
        const selectedTrialIds: string[] = [];
        if (this.state.trials) {
            this.state.trials.forEach(trial => {
                if (trial.collaborators.includes(this.props.account.email)) {
                    selectedTrialIds.push(trial.trial_id);
                }
            });
        }

        return (
            <>
                <Dialog open={this.props.open} onClose={this.handleCancel}>
                    <DialogTitle id="confirmation-dialog-title">
                        Select Trials
                    </DialogTitle>
                    {!this.state.trials && (
                        <div className="User-account-progress">
                            <CircularProgress />
                        </div>
                    )}
                    <DialogContent>
                        {this.state.trials && (
                            <div>
                                <Table>
                                    <TableBody>
                                        {this.state.trials
                                            .slice(
                                                this.state.page *
                                                    this.state.rowsPerPage,
                                                this.state.page *
                                                    this.state.rowsPerPage +
                                                    this.state.rowsPerPage
                                            )
                                            .map((trial: Trial) => {
                                                return (
                                                    <TableRow key={trial._id}>
                                                        <TableCell
                                                            style={{
                                                                fontSize: 18
                                                            }}
                                                        >
                                                            <FormControlLabel
                                                                key={trial._id}
                                                                label={
                                                                    trial.trial_id
                                                                }
                                                                control={
                                                                    <Checkbox
                                                                        checked={selectedTrialIds.includes(
                                                                            trial.trial_id
                                                                        )}
                                                                        value={
                                                                            trial._id
                                                                        }
                                                                        onChange={
                                                                            this
                                                                                .handleChange
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
                    <DialogActions>
                        <Button onClick={this.handleCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSave} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}
