import React from "react";
import {
    Dialog,
    DialogTitle,
    TextField,
    Button,
    DialogContent,
    DialogActions,
    DialogContentText
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { createTrial } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";
import { RouteComponentProps, withRouter } from "react-router-dom";

export interface ITrialCreationDialogProps extends RouteComponentProps {
    open: boolean;
    onClose: () => void;
}

const TrailCreationDialog: React.FC<ITrialCreationDialogProps> = ({
    open,
    onClose,
    history
}) => {
    const navigateToEditForm = (trialId: string) => {
        history.push(`trials/edit/${trialId}`);
    };

    const { idToken } = React.useContext(AuthContext)!;
    const [apiError, setApiError] = React.useState<string | null>();

    const handleClose = () => {
        setApiError(null);
        onClose();
    };

    const {
        register,
        errors,
        handleSubmit,
        getValues,
        formState: { isSubmitting }
    } = useForm();
    const inputName = "protocol_identifier";

    const hasError = !!errors[inputName] || !!apiError;
    const errorMessage = errors[inputName]?.message || apiError;

    return (
        <Dialog open={open} onClose={handleClose}>
            <form
                onSubmit={handleSubmit(() => {
                    const trialId = getValues(inputName);
                    return createTrial(idToken, {
                        trial_id: trialId,
                        metadata_json: {
                            protocol_identifier: trialId,
                            participants: [],
                            allowed_collection_event_names: [],
                            allowed_cohort_names: []
                        }
                    })
                        .then(trial => {
                            navigateToEditForm(trial.trial_id);
                        })
                        .catch(({ response: { data } }) => {
                            const message = data._error.message;
                            if (
                                typeof message === "string" &&
                                message.includes("violates unique constraint")
                            ) {
                                setApiError(
                                    "A trial with this protocol identifier already exists"
                                );
                            } else {
                                setApiError(
                                    "Encountered an unexpected error handling your request"
                                );
                            }
                        });
                })}
            >
                <DialogTitle>Create A New Trial</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide the unique identifier for this clinical
                        trial used by the lead study organization. This is
                        usually a short identifier, e.g., "E4412".
                    </DialogContentText>
                    <TextField
                        fullWidth
                        disabled={isSubmitting}
                        name={inputName}
                        label="Protocol Identifier"
                        inputRef={register({
                            required: "This is a required field"
                        })}
                        error={hasError}
                        helperText={errorMessage}
                        onChange={() => setApiError("")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        Create and continue
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default withRouter(TrailCreationDialog);
