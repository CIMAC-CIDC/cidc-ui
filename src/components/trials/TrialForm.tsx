import React from "react";
import moment from "moment";
import { useQueryParam, NumberParam } from "use-query-params";
import {
    Stepper,
    Step,
    StepLabel,
    Grid,
    Divider,
    Card,
    CardHeader,
    Button,
    Typography,
    CircularProgress
} from "@material-ui/core";
import TrialInfoStep from "./steps/TrialInfoStep";
import CollectionEventsStep from "./steps/CollectionEventsStep";
import ParticipantsStep from "./steps/ParticipantsStep";
import BiospecimensStep from "./steps/BiospecimensStep";
import { mergeWith, isArray, pickBy, Dictionary } from "lodash";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { getTrial, updateTrialMetadata } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";
import { Save } from "@material-ui/icons";
import CohortNamesStep from "./steps/CohortNamesStep";
import Alert from "../generic/Alert";

export interface ITrialMetadata extends Dictionary<any> {}

const TrialFormContext = React.createContext<{
    trial: ITrialMetadata;
    lastUpdated?: string;
    updateTrial: (
        updates: Partial<ITrialMetadata>,
        saveToDb?: boolean
    ) => Promise<any>;
    activeStep: number;
    hasChanged: boolean;
    setHasChanged: (v: boolean) => void;
    nextStep: (getValues: () => Partial<ITrialMetadata>) => void;
    prevStep: (getValues: () => Partial<ITrialMetadata>) => void;
    shouldSave: boolean;
    saveErrors: string[];
    clearSaveErrors: () => void;
    triggerSave: () => void;
} | null>(null);

export const useTrialFormContext = () => React.useContext(TrialFormContext)!;

const TrialFormProvider: React.FC<RouteComponentProps<{
    trial_id: string;
}>> = ({
    children,
    match: {
        params: { trial_id }
    }
}) => {
    const { idToken } = React.useContext(AuthContext)!;
    const [shouldSave, setShouldSave] = React.useState<boolean>(false);
    const [saveErrors, setSaveErrors] = React.useState<string[]>([]);
    const triggerSave = () => setShouldSave(true);

    const [trial, setTrial] = React.useState<ITrialMetadata | undefined>();
    const [lastUpdated, setLastUpdated] = React.useState<string | undefined>();
    React.useEffect(() => {
        getTrial(idToken, trial_id).then(({ _updated, metadata_json }) => {
            setTrial(metadata_json);
            setLastUpdated(_updated);
        });
    }, [idToken, trial_id]);

    const [hasChanged, setHasChanged] = React.useState<boolean>(false);
    useBeforeUnloadWarning(hasChanged);

    const updateTrial = (
        updates: Partial<ITrialMetadata>,
        saveToDb?: boolean
    ) => {
        // Provide a default value for `participants.samples`
        const participants = updates.participants?.map((p: any) => {
            return { ...p, samples: p.samples || [] };
        });
        const cleanUpdates = pickBy({ ...updates, participants }, v => !!v);
        const updatedMetadata = mergeWith(
            { ...trial },
            cleanUpdates,
            (obj: any, src: any) => {
                if (isArray(obj)) {
                    return src;
                }
            }
        );
        if (hasChanged) {
            if (saveToDb) {
                return getTrial(idToken, trial_id).then(({ _etag }) =>
                    updateTrialMetadata(idToken, _etag, {
                        trial_id,
                        metadata_json: updatedMetadata
                    })
                        .then(({ _updated, metadata_json }) => {
                            setLastUpdated(_updated);
                            setShouldSave(false);
                            setTrial(metadata_json);
                            setHasChanged(false);
                        })
                        .catch(({ response: { data } }) => {
                            setSaveErrors(data._error.message.errors);
                            setShouldSave(false);
                            return Promise.reject(
                                "couldn't save trial metadata"
                            );
                        })
                );
            } else {
                setTrial(updatedMetadata);
            }
        }
        return Promise.resolve();
    };

    const [step, setStep] = useQueryParam("step", NumberParam);
    // Force step parameter in bounds
    const activeStep = Math.min(steps.length, Math.max(0, step || 0));
    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === steps.length - 1;

    const nextStep = (getValues: () => Partial<ITrialMetadata>) => {
        const newStep = isLastStep ? activeStep : activeStep + 1;
        updateTrial(getValues()).then(() => setStep(newStep));
    };

    const prevStep = (getValues: () => Partial<ITrialMetadata>) => {
        const newStep = isFirstStep ? activeStep : activeStep - 1;
        updateTrial(getValues()).then(() => setStep(newStep));
    };

    return trial ? (
        <TrialFormContext.Provider
            value={{
                trial,
                lastUpdated,
                updateTrial,
                activeStep,
                hasChanged,
                setHasChanged,
                nextStep,
                prevStep,
                shouldSave,
                saveErrors,
                clearSaveErrors: () => setSaveErrors([]),
                triggerSave
            }}
        >
            {children}
        </TrialFormContext.Provider>
    ) : null;
};
const TrialFormProviderWithRouter = withRouter(TrialFormProvider);

export const useTrialFormSaver = (getValues: () => Partial<ITrialMetadata>) => {
    const { shouldSave, updateTrial } = useTrialFormContext();

    React.useEffect(() => {
        if (shouldSave) {
            updateTrial(getValues(), true);
        }
    }, [shouldSave, updateTrial, getValues]);
};

const steps = [
    <TrialInfoStep />,
    <CollectionEventsStep />,
    <CohortNamesStep />,
    <ParticipantsStep />,
    <BiospecimensStep />
];

const SaveButton: React.FC = () => {
    const {
        hasChanged,
        triggerSave,
        saveErrors,
        clearSaveErrors,
        lastUpdated
    } = useTrialFormContext();
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (!hasChanged) {
            setIsSaving(false);
        }
    }, [hasChanged]);

    const lastUpdatedText = moment.utc(lastUpdated).fromNow();

    return (
        <Grid container spacing={2} alignItems="baseline">
            <Grid item>
                {lastUpdated && (
                    <Typography variant="subtitle1" color="textSecondary">
                        {`Last updated ${lastUpdatedText}.`}
                    </Typography>
                )}
            </Grid>
            <Grid item>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!hasChanged || isSaving}
                    startIcon={<Save />}
                    endIcon={
                        isSaving && (
                            <CircularProgress size={12} color="inherit" />
                        )
                    }
                    onClick={() => {
                        triggerSave();
                        setIsSaving(true);
                    }}
                >
                    Save Changes
                </Button>
            </Grid>
            <Alert
                title="Encountered errors while trying to save metadata"
                description={saveErrors.toString()}
                open={!!saveErrors.length}
                onAccept={() => {
                    setIsSaving(false);
                    clearSaveErrors();
                }}
            />
        </Grid>
    );
};

const InnerTrialForm: React.FC = () => {
    const { activeStep, trial } = useTrialFormContext();

    return (
        <Card style={{ width: "100%" }}>
            <CardHeader
                title={
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>
                            Editing metadata for {trial.protocol_identifier}
                        </Grid>
                        <Grid item>
                            <SaveButton />
                        </Grid>
                    </Grid>
                }
            />
            <Grid container direction="column" spacing={3} alignItems="stretch">
                <Grid item>
                    <Stepper activeStep={activeStep}>
                        <Step>
                            <StepLabel>Trial Info</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Collection Events</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Cohort Names</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Participants</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Biospecimens</StepLabel>
                        </Step>
                    </Stepper>
                </Grid>
                <Grid item>
                    <Divider />
                </Grid>
                <Grid item style={{ margin: "1em" }}>
                    {steps[activeStep]}
                </Grid>
            </Grid>
        </Card>
    );
};

/* Warn the user before they leave the page */
const useBeforeUnloadWarning = (issueWarning: boolean) => {
    const unloadListener = (event: BeforeUnloadEvent) => {
        // Cancel the "before unload" event.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "";
    };

    React.useEffect(() => {
        if (issueWarning) {
            window.addEventListener("beforeunload", unloadListener);
        } else {
            window.removeEventListener("beforeunload", unloadListener);
        }
        return () => window.removeEventListener("beforeunload", unloadListener);
    }, [issueWarning]);
};

const TrialForm: React.FC = () => {
    return (
        <TrialFormProviderWithRouter>
            <InnerTrialForm />
        </TrialFormProviderWithRouter>
    );
};

export default TrialForm;
