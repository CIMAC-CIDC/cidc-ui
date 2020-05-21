import React from "react";
import { useQueryParam, NumberParam } from "use-query-params";
import {
    Stepper,
    Step,
    StepLabel,
    Grid,
    Divider,
    Card,
    CardHeader
} from "@material-ui/core";
import { Control } from "react-hook-form";
import TrialInfoStep from "./_TrialInfoStep";
import CollectionEventsStep from "./_CollectionEventsStep";
import ParticipantsStep from "./_ParticipantsStep";
import BiospecimensStep from "./_BiospecimensStep";
import { mergeWith, isArray, pickBy, Dictionary } from "lodash";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { getTrial, updateTrialMetadata } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";

export interface ITrialMetadata extends Dictionary<any> {}

const TrialFormContext = React.createContext<{
    trial: ITrialMetadata;
    updateTrial: (updates: Partial<ITrialMetadata>) => void;
    activeStep: number;
    nextStep: (getValues: Control["getValues"]) => void;
    prevStep: (getValues: Control["getValues"]) => void;
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
    const [trial, setTrial] = React.useState<ITrialMetadata | null>();
    React.useEffect(() => {
        getTrial(idToken, trial_id).then(({ metadata_json }) =>
            setTrial(metadata_json)
        );
    }, [idToken, trial_id]);

    const updateTrial = (updates: Partial<ITrialMetadata>) => {
        // Provide a default value for `participants.samples`
        const participants = updates.participants?.map((p: any) => {
            return { ...p, samples: p.samples || [] };
        });
        const cleanUpdates = pickBy({ ...updates, participants }, v => !!v);
        const updatedMetadata = mergeWith(
            trial,
            cleanUpdates,
            (obj: any, src: any) => {
                if (isArray(obj)) {
                    return src;
                }
            }
        );
        setTrial(updatedMetadata);
        getTrial(idToken, trial_id).then(({ _etag }) =>
            updateTrialMetadata(idToken, _etag, {
                trial_id,
                metadata_json: updatedMetadata
            })
        );
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

    return trial ? (
        <TrialFormContext.Provider
            value={{ trial, updateTrial, activeStep, nextStep, prevStep }}
        >
            {children}
        </TrialFormContext.Provider>
    ) : null;
};
const TrialFormProviderWithRouter = withRouter(TrialFormProvider);

const steps = [
    <TrialInfoStep />,
    <CollectionEventsStep />,
    <ParticipantsStep />,
    <BiospecimensStep />
];

const InnerTrialForm: React.FC = () => {
    const { activeStep, trial } = useTrialFormContext();

    return (
        <Card>
            <CardHeader
                title={`Editing metadata for ${trial.protocol_identifier}`}
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
                <Grid>
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
    return (
        <TrialFormProviderWithRouter>
            <InnerTrialForm />
        </TrialFormProviderWithRouter>
    );
};

export default TrialForm;
