import React from "react";
import { Grid } from "@material-ui/core";
import { useTrialFormContext, useTrialFormSaver } from "../TrialForm";
import { useForm, FormContext } from "react-hook-form";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow
} from "./FormStepDataSheet";
import FormStepHeader from "./FormStepHeader";
import FormStepFooter from "./FormStepFooter";

const KEY_NAME = "allowed_cohort_names";

const makeRow = (cohortName?: string) => {
    if (cohortName) {
        return [{ value: cohortName }];
    } else {
        return [{ value: "" }];
    }
};

const getCellName = ({ row }: any) => `${KEY_NAME}[${row}]`;

const CohortNamesStep: React.FC = () => {
    const { trial, setHasChanged } = useTrialFormContext();
    const formInstance = useForm({ mode: "onBlur" });
    const { getValues, handleSubmit } = formInstance;
    const getCohortNames = () => getValues({ nest: true });

    useTrialFormSaver(getCohortNames);

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const headers = makeHeaderRow(["Allowed Cohort Names"]);
        const defaultValues = trial[KEY_NAME];
        if (!!defaultValues && defaultValues.length > 0) {
            return [headers, ...defaultValues.map((c: string) => makeRow(c))];
        } else {
            return [headers, makeRow()];
        }
    });

    const getCellValidation = () => (value: string) => {
        if (!value) {
            return "This is a required field";
        }
    };

    return (
        <FormContext {...formInstance}>
            <form>
                <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                >
                    <Grid item>
                        <FormStepHeader
                            title="Define Cohort Names"
                            subtitle={
                                "Specify the names of the cohorts to which participants in this trial may be assigned. This list will be used to catch typos when entering participant-level cohort information on the next step of this form."
                            }
                        />
                    </Grid>
                    <Grid item>
                        <FormStepDataSheet
                            grid={grid}
                            setGrid={g => {
                                setHasChanged(true);
                                setGrid(g);
                            }}
                            colToAttr={{ 0: "" }}
                            rootObjectName={KEY_NAME}
                            addRowsButtonText="Add a cohort name"
                            addRowsIncrement={1}
                            getCellName={getCellName}
                            getCellValidation={getCellValidation}
                            processCellValue={({ value }) => value}
                            makeEmptyRow={makeRow}
                        />
                    </Grid>
                </Grid>
                <FormStepFooter
                    backButton
                    nextButton
                    getValues={getCohortNames}
                    handleSubmit={handleSubmit}
                />
            </form>
        </FormContext>
    );
};

export default CohortNamesStep;
