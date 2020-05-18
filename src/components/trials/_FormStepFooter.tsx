import React from "react";
import { Grid, Button } from "@material-ui/core";
import { useFormContext } from "react-hook-form";
import { useTrialFormContext } from "./TrialForm";

export interface ITrialFormFooterProps {
    backButton?: boolean;
    nextButton?: boolean;
}

const FormStepFooter: React.FC<ITrialFormFooterProps> = ({
    backButton,
    nextButton
}) => {
    const { getValues, handleSubmit } = useFormContext();
    const { prevStep, nextStep } = useTrialFormContext();

    return (
        <Grid
            container
            justify="space-between"
            alignItems="baseline"
            style={{ marginTop: "1em" }}
        >
            <Grid item>
                {backButton && (
                    <Button onClick={handleSubmit(() => prevStep(getValues))}>
                        back
                    </Button>
                )}
            </Grid>
            <Grid item>
                {nextButton && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(() => nextStep(getValues))}
                    >
                        save and continue
                    </Button>
                )}
            </Grid>
        </Grid>
    );
};

export default FormStepFooter;
