import React from "react";
import { Grid, Button } from "@material-ui/core";
import { useTrialFormContext, ITrialMetadata } from "../TrialForm";
import { FormContextValues } from "react-hook-form";

export interface ITrialFormFooterProps {
    backButton?: boolean;
    nextButton?: boolean;
    handleSubmit?: FormContextValues["handleSubmit"];
    getValues: () => ITrialMetadata;
}

const FormStepFooter: React.FC<ITrialFormFooterProps> = ({
    backButton,
    nextButton,
    getValues,
    handleSubmit
}) => {
    const { prevStep, nextStep } = useTrialFormContext();
    const goToPrevStep = () => prevStep(getValues);
    const goToNextStep = () => nextStep(getValues);

    return (
        <Grid
            container
            justify="space-between"
            alignItems="baseline"
            style={{ marginTop: "1em" }}
        >
            <Grid item>
                {backButton && (
                    <Button
                        onClick={
                            handleSubmit
                                ? handleSubmit(goToPrevStep)
                                : goToPrevStep
                        }
                    >
                        back
                    </Button>
                )}
            </Grid>
            <Grid item>
                <Grid container justify="flex-end" spacing={1}>
                    <Grid item>
                        {nextButton && (
                            <Button
                                onClick={
                                    handleSubmit
                                        ? handleSubmit(goToNextStep)
                                        : goToNextStep
                                }
                            >
                                save and continue
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FormStepFooter;
