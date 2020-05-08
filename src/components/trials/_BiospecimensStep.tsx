import React from "react";
import { useTrialFormContext } from "./TrialForm";
import { useForm, FormContext } from "react-hook-form";
import { Grid } from "@material-ui/core";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";

const BiospecimensStep: React.FC = () => {
    const formInstance = useForm({ mode: "onBlur" });
    const { nextStep } = useTrialFormContext();

    return (
        <FormContext {...formInstance}>
            <form
                onSubmit={formInstance.handleSubmit(() => {
                    nextStep(formInstance.getValues);
                })}
            >
                <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                >
                    <Grid item>
                        <FormStepHeader
                            title="Add Biospecimens"
                            subtitle={
                                "Collection events are the timepoints at which biomaterial is collected from a trial participant. These events, along with what sample types will be collected, should be specified in the clinical trial plan."
                            }
                        />
                    </Grid>
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default BiospecimensStep;
