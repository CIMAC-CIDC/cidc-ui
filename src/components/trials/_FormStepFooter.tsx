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
                <Grid container justify="flex-end" spacing={1}>
                    <Grid item>
                        {nextButton && (
                            <Button
                                onClick={handleSubmit(() =>
                                    nextStep(getValues)
                                )}
                            >
                                next
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FormStepFooter;
