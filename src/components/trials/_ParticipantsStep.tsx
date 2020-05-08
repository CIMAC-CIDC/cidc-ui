import React from "react";
import { useTrialFormContext } from "./TrialForm";
import { useForm, FormContext } from "react-hook-form";
import { Grid, Tooltip, IconButton } from "@material-ui/core";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow,
    makeEmptyRow
} from "./_FormStepDataSheet";
import { Add, Remove } from "@material-ui/icons";

const KEY_NAME = "participants";
const ATTR_NAMES = [
    "cidc_participant_id",
    "cimac_participant_id",
    "participant_id"
];

const ParticipantsStep: React.FC = () => {
    const { nextStep, trial } = useTrialFormContext();
    const formInstance = useForm({ mode: "onBlur" });

    const defaultValues = trial[KEY_NAME];
    const defaultCells = !!defaultValues
        ? defaultValues.map((v: any, row: number) => [
              { readOnly: true, value: row + 1 },
              ...ATTR_NAMES.map(attr => ({ value: v[attr] }))
          ])
        : [makeEmptyRow(1, ATTR_NAMES.length)];

    const [grid, setGrid] = React.useState<IGridElement[][]>([
        makeHeaderRow(
            "CIDC Participant ID",
            "CIMAC Participant ID",
            "Trial Participant ID"
        ),
        ...defaultCells
    ]);

    const addRow = () => {
        setGrid([...grid, makeEmptyRow(grid.length, ATTR_NAMES.length)]);
    };
    const removeRow = () => {
        setGrid(grid.slice(0, grid.length - 1));
    };

    const disableRemoveRow = grid.length <= 2;

    const dataSheet = (
        <FormStepDataSheet
            grid={grid}
            setGrid={setGrid}
            getCellName={({ row, col }) =>
                `${KEY_NAME}[${row - 1}].${ATTR_NAMES[col - 1]}`
            }
            processCellValue={v => v}
        />
    );

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
                            title="Add Trial Participants"
                            subtitle="A list of all participants in this trial. Please include all trial-specific local participant identifiers in addition to CIMAC global identifiers."
                        />
                    </Grid>
                    <Grid item>{dataSheet}</Grid>
                    <Grid item>
                        <Tooltip title="add a row" placement="bottom">
                            <IconButton color="primary" onClick={addRow}>
                                <Add />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="remove last row" placement="bottom">
                            <IconButton
                                disabled={disableRemoveRow}
                                color="secondary"
                                onClick={removeRow}
                            >
                                <Remove />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default ParticipantsStep;
