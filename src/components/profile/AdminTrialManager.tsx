import React from "react";
import {
    getTrials,
    createTrial,
    updateTrialMetadata,
    getTrial
} from "../../api/api";
import { Trial } from "../../model/trial";
import {
    Card,
    CardHeader,
    Typography,
    CardContent,
    Grid,
    TextField,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CardActions,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    FormControlLabel,
    GridProps,
    AccordionActions
} from "@material-ui/core";
import { LibraryAdd, Add, ExpandMore } from "@material-ui/icons";
import { withIdToken } from "../identity/AuthProvider";
import {
    Controller,
    FormContext,
    useForm,
    useFormContext
} from "react-hook-form";
import { mapValues, omit, omitBy, range } from "lodash";
import { Skeleton } from "@material-ui/lab";

const TrialTextField: React.FC<{
    name: string;
    label: string;
    width: GridProps["xs"];
}> = ({ name, label, width }) => {
    const { register } = useFormContext();

    return (
        <Grid item xs={width}>
            <TextField
                fullWidth
                multiline
                id={name}
                name={name}
                label={label}
                inputRef={register}
            />
        </Grid>
    );
};

const TrialStatusField: React.FC<{ width: GridProps["xs"] }> = ({ width }) => {
    const { control } = useFormContext();
    const name = "trial_status";

    return (
        <Grid item xs={width}>
            <FormControl component="fieldset">
                <FormLabel component="legend">Trial Status</FormLabel>
                <Controller
                    as={
                        <RadioGroup row>
                            {["New", "Ongoing", "Completed"].map(v => (
                                <FormControlLabel
                                    key={v}
                                    label={v}
                                    value={v}
                                    control={<Radio size="small" />}
                                />
                            ))}
                        </RadioGroup>
                    }
                    name={name}
                    control={control}
                />
            </FormControl>
        </Grid>
    );
};

const excludeFields = ["participants", "assays", "analyses", "shipments"];
const arrayFields = [
    "allowed_cohort_names",
    "allowed_collection_event_names",
    "lead_cimac_pis",
    "lead_cimac_contacts",
    "lead_trial_staff"
];

const TrialAccordion = withIdToken<{
    trial: Trial;
    onUpdatedTrial: (trial: Trial) => void;
}>(({ trial, onUpdatedTrial, token }) => {
    const [apiError, setApiError] = React.useState<string>("");

    const formValues = useForm({
        defaultValues: omit(trial.metadata_json, ...excludeFields)
    });
    const submissionHandler = formValues.handleSubmit(async () => {
        const cleanValues = omitBy(formValues.getValues(), (_, k) => {
            // omit fields that the user hasn't interacted with
            return !formValues.formState.dirtyFields.has(k);
        });
        const parsedValues = mapValues(cleanValues, (v, k) => {
            return arrayFields.includes(k)
                ? v.split(",").map((p: string) => p.trim())
                : v;
        });
        const updatedMetadata = {
            ...trial.metadata_json,
            ...parsedValues
        };
        try {
            const { _etag } = await getTrial(token, trial.trial_id);
            const updatedTrial = await updateTrialMetadata(token, _etag, {
                trial_id: trial.trial_id,
                metadata_json: updatedMetadata
            });
            onUpdatedTrial(updatedTrial);
            const newFormValues = omit(
                updatedTrial.metadata_json,
                ...excludeFields
            );
            formValues.reset(newFormValues);
        } catch ({ response: { data } }) {
            setApiError(JSON.stringify(data));
        }
    });

    return (
        <FormContext {...formValues}>
            <form onSubmit={submissionHandler}>
                <Accordion variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                        >
                            <Typography>{trial.trial_id}</Typography>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={1}>
                            <TrialTextField
                                name="allowed_cohort_names"
                                label="Cohort Names (comma-separated)"
                                width={6}
                            />
                            <TrialTextField
                                name="allowed_collection_event_names"
                                label="Collection Event Names (comma-separated)"
                                width={6}
                            />
                            <TrialTextField
                                name="trial_name"
                                label="Trial Name"
                                width={12}
                            />
                            <TrialTextField
                                name="nci_id"
                                label="NCI Identifier"
                                width={4}
                            />
                            <TrialTextField
                                name="nct_id"
                                label="ClinicalTrials.gov ID (NCT number)"
                                width={4}
                            />
                            <TrialTextField
                                name="grant_or_affiliated_network"
                                label="Grant or Affiliated network"
                                width={4}
                            />
                            <TrialStatusField width={4} />
                            <TrialTextField
                                name="biobank"
                                label="Biobank"
                                width={8}
                            />
                            <TrialTextField
                                name="lead_cimac_pis"
                                label="Lead CIMAC PI(s)"
                                width={4}
                            />
                            <TrialTextField
                                name="lead_cimac_contacts"
                                label="Lead CIMAC Contacts"
                                width={4}
                            />
                            <TrialTextField
                                name="lead_trial_staff"
                                label="Lead Trial Staff"
                                width={4}
                            />
                            <TrialTextField
                                name="justification"
                                label="Justification"
                                width={12}
                            />
                            <TrialTextField
                                name="biomarker_plan"
                                label="Biomarker Plan"
                                width={12}
                            />
                            <TrialTextField
                                name="data_sharing_plan"
                                label="Data Sharing Plan"
                                width={12}
                            />
                            {apiError && (
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        color="secondary"
                                    >
                                        <code>{apiError}</code>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </AccordionDetails>
                    <AccordionActions>
                        {formValues.formState.dirty && (
                            <Button
                                type="reset"
                                onClick={() => {
                                    formValues.reset();
                                    setApiError("");
                                }}
                            >
                                discard changes
                            </Button>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={
                                !formValues.formState.dirty ||
                                formValues.formState.isSubmitting
                            }
                        >
                            {!formValues.formState.dirty &&
                            formValues.formState.isSubmitted
                                ? "changes saved!"
                                : "save changes"}
                        </Button>
                    </AccordionActions>
                </Accordion>
            </form>
        </FormContext>
    );
});

interface ICreateNewTrialProps {
    onNewTrial: (trial: Trial) => void;
}

const CreateNewTrial = withIdToken<ICreateNewTrialProps>(
    ({ token, onNewTrial }) => {
        const [isCreating, setIsCreating] = React.useState<boolean>(false);

        const {
            register,
            errors,
            handleSubmit,
            getValues,
            formState: { isSubmitting }
        } = useForm();
        const inputName = "protocol_identifier";
        const handleSuccess = (trial: Trial) => {
            setIsCreating(false);
            onNewTrial(trial);
        };
        const handleError = ({ response: { data } }: any) => {
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
        };
        const submissionHandler = handleSubmit(() => {
            const trialId = getValues(inputName);
            return createTrial(token, {
                trial_id: trialId,
                metadata_json: {
                    protocol_identifier: trialId,
                    participants: [],
                    allowed_collection_event_names: [],
                    allowed_cohort_names: []
                }
            })
                .then(handleSuccess)
                .catch(handleError);
        });

        const [apiError, setApiError] = React.useState<string | null>();
        const hasError = !!errors[inputName] || !!apiError;
        const errorMessage = errors[inputName]?.message || apiError;

        return isCreating ? (
            <form onSubmit={submissionHandler}>
                <Card>
                    <CardHeader
                        title={<Typography>Trial Creation</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body2">
                            Please provide the unique identifier for this
                            clinical trial used by the lead study organization.
                            This is usually a short identifier, e.g., "E4412".
                        </Typography>
                        <TextField
                            fullWidth
                            disabled={isSubmitting}
                            id={inputName}
                            name={inputName}
                            label="Protocol Identifier"
                            inputRef={register({
                                required: "This is a required field"
                            })}
                            error={hasError}
                            helperText={errorMessage}
                            onChange={() => setApiError("")}
                        />
                    </CardContent>
                    <CardActions>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            Submit
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            onClick={() => setIsCreating(false)}
                        >
                            Cancel
                        </Button>
                    </CardActions>
                </Card>
            </form>
        ) : (
            <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<Add />}
                onClick={() => setIsCreating(true)}
            >
                create a new trial
            </Button>
        );
    }
);

const TrialManager: React.FC<{ token: string }> = ({ token }) => {
    const [trials, setTrials] = React.useState<Trial[] | undefined>();
    React.useEffect(() => {
        // TODO: get smarter about pagination
        getTrials(token, { page_size: 200 }).then(ts => setTrials(ts));
    }, [token]);

    return (
        <Card>
            <CardHeader
                avatar={<LibraryAdd />}
                title={<Typography variant="h6">Manage Trials</Typography>}
            />
            <CardContent>
                <Grid container direction="column" spacing={1}>
                    {trials ? (
                        <>
                            <Grid item>
                                <CreateNewTrial
                                    onNewTrial={trial =>
                                        setTrials([trial, ...trials])
                                    }
                                />
                            </Grid>
                            {trials.map((trial, i) => {
                                return (
                                    <Grid item key={trial.trial_id}>
                                        <TrialAccordion
                                            trial={trial}
                                            onUpdatedTrial={updatedTrial => {
                                                const ts = trials.slice(
                                                    0,
                                                    trials.length
                                                );
                                                ts.splice(i, 1, updatedTrial);
                                                setTrials(ts);
                                            }}
                                        />
                                    </Grid>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            {range(10).map(i => (
                                <Grid key={i} item>
                                    <Skeleton height={40} />
                                </Grid>
                            ))}
                        </>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default withIdToken(TrialManager);
