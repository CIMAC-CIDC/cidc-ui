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
    Typography
} from "@material-ui/core";
import { Control } from "react-hook-form";
import TrialInfoStep from "./_TrialInfoStep";
import CollectionEventsStep from "./_CollectionEventsStep";
import ParticipantsStep from "./_ParticipantsStep";
import BiospecimensStep from "./_BiospecimensStep";
import { mergeWith, isArray, pickBy, Dictionary, isEqual } from "lodash";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { getTrial, updateTrialMetadata } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";
import { Save } from "@material-ui/icons";

export interface ITrialMetadata extends Dictionary<any> {}

const TrialFormContext = React.createContext<{
    trial: ITrialMetadata;
    lastUpdated?: string;
    updateTrial: (updates: Partial<ITrialMetadata>, saveToDb?: boolean) => void;
    activeStep: number;
    hasChanged: boolean;
    setHasChanged: (v: boolean) => void;
    nextStep: (getValues: Control["getValues"]) => void;
    prevStep: (getValues: Control["getValues"]) => void;
    shouldSave: boolean;
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
    const triggerSave = () => setShouldSave(true);

    const [savedTrial, setSavedTrial] = React.useState<
        ITrialMetadata | undefined
    >();
    const [localTrial, setLocalTrial] = React.useState<
        ITrialMetadata | undefined
    >();
    const [lastUpdated, setLastUpdated] = React.useState<string | undefined>();
    React.useEffect(() => {
        getTrial(idToken, trial_id).then(({ _updated, metadata_json }) => {
            setLocalTrial(metadata_json);
            setSavedTrial(metadata_json);
            setLastUpdated(_updated);
        });
    }, [idToken, trial_id]);

    const [hasChanged, setHasChanged] = React.useState<boolean>(false);
    React.useEffect(() => {
        setHasChanged(!isEqual(localTrial, savedTrial));
    }, [localTrial, savedTrial]);

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
            { ...localTrial },
            cleanUpdates,
            (obj: any, src: any) => {
                if (isArray(obj)) {
                    return src;
                }
            }
        );
        if (hasChanged && saveToDb) {
            getTrial(idToken, trial_id).then(({ _etag }) =>
                updateTrialMetadata(idToken, _etag, {
                    trial_id,
                    metadata_json: updatedMetadata
                }).then(({ _updated, metadata_json }) => {
                    setSavedTrial(metadata_json);
                    setLastUpdated(_updated);
                    setShouldSave(false);
                })
            );
        }
        setLocalTrial(updatedMetadata);
    };

    const [step, setStep] = useQueryParam("step", NumberParam);
    // Force step parameter in bounds
    const activeStep = Math.min(steps.length, Math.max(0, step || 0));
    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === steps.length - 1;

    const nextStep = (getValues: Control["getValues"]) => {
        const newStep = isLastStep ? activeStep : activeStep + 1;
        setStep(newStep);
        updateTrial(getValues({ nest: true }));
    };

    const prevStep = (getValues: Control["getValues"]) => {
        const newStep = isFirstStep ? activeStep : activeStep - 1;
        setStep(newStep);
        updateTrial(getValues({ nest: true }));
    };

    return localTrial ? (
        <TrialFormContext.Provider
            value={{
                trial: localTrial,
                lastUpdated,
                updateTrial,
                activeStep,
                hasChanged,
                setHasChanged,
                nextStep,
                prevStep,
                shouldSave,
                triggerSave
            }}
        >
            {children}
        </TrialFormContext.Provider>
    ) : null;
};
const TrialFormProviderWithRouter = withRouter(TrialFormProvider);

export const useTrialFormSaver = (getValues: Control["getValues"]) => {
    const { shouldSave, updateTrial } = useTrialFormContext();

    React.useEffect(() => {
        if (shouldSave) {
            updateTrial(getValues({ nest: true }), true);
        }
    }, [shouldSave, updateTrial, getValues]);
};

const steps = [
    <TrialInfoStep />,
    <CollectionEventsStep />,
    <ParticipantsStep />,
    <BiospecimensStep />
];

const InnerTrialForm: React.FC = () => {
    const {
        activeStep,
        trial,
        lastUpdated,
        hasChanged,
        triggerSave
    } = useTrialFormContext();

    const lastUpdatedText = moment.utc(lastUpdated).fromNow();

    return (
        <Card>
            <CardHeader
                title={
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>
                            Editing metadata for {trial.protocol_identifier}
                        </Grid>
                        <Grid item>
                            <Grid container spacing={2} alignItems="baseline">
                                <Grid item>
                                    {lastUpdated && (
                                        <Typography
                                            variant="subtitle1"
                                            color="textSecondary"
                                        >
                                            {`Last updated ${lastUpdatedText}.`}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!hasChanged}
                                        startIcon={<Save />}
                                        onClick={() => triggerSave()}
                                    >
                                        Save Changes
                                    </Button>
                                </Grid>
                            </Grid>
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

const TrialForm: React.FC = () => {
    React.useEffect(() => {
        const listener = (event: BeforeUnloadEvent) => {
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", listener);
        return () => window.removeEventListener("beforeunload", listener);
    }, []);

    return (
        <TrialFormProviderWithRouter>
            <InnerTrialForm />
        </TrialFormProviderWithRouter>
    );
};

export default TrialForm;
