import React from "react";
import some from "lodash/some";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";
import { useForm, FormContext } from "react-hook-form";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import { useTrialFormContext } from "./TrialForm";
import FormStepDataSheet, {
    IGridElement,
    makeEmptyRow,
    makeHeaderRow
} from "./_FormStepDataSheet";

const KEY_NAME = "collection_event_matrix";
const ATTR_NAMES = ["collection_event", "sample_types"];
const SAMPLE_TYPE_DELIMITER = ",";

const CollectionEventsStep: React.FC = () => {
    const formInstance = useForm({ mode: "onBlur" });
    const { nextStep, trial } = useTrialFormContext();

    const defaultValues = trial[KEY_NAME];
    const defaultCells = !!defaultValues
        ? defaultValues.map((v: any, row: number) => [
              { readOnly: true, value: row + 1 },
              { value: v.collection_event },
              { value: v.sample_types.join(SAMPLE_TYPE_DELIMITER) }
          ])
        : [makeEmptyRow(1, ATTR_NAMES.length)];

    const [grid, setGrid] = React.useState<IGridElement[][]>([
        makeHeaderRow("Collection Event", "Specimen Types (Comma-Separated)"),
        ...defaultCells
    ]);
    const addRow = () => {
        setGrid([...grid, makeEmptyRow(grid.length, ATTR_NAMES.length)]);
    };
    const removeRow = () => {
        setGrid(grid.slice(0, grid.length - 1));
    };

    const bottomRow = grid[grid.length - 1];
    const disableAddRow = some(bottomRow, cell => !cell.value);
    const disableRemoveRow = grid.length <= 2;

    const dataSheet = (
        <FormStepDataSheet
            grid={grid}
            setGrid={setGrid}
            getCellName={({ row, col }) => {
                return `${KEY_NAME}[${row - 1}].${ATTR_NAMES[col - 1]}`;
            }}
            processCellValue={(v, { col }) => {
                switch (col) {
                    // collection event
                    case 1:
                        return v;
                    // sample types (comma-delimited)
                    case 2:
                        const splitted = v.split(SAMPLE_TYPE_DELIMITER);
                        const trimmed = splitted.map(s => s.trim());
                        return trimmed;
                    default:
                        return v;
                }
            }}
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
                            title="Add Collection Events"
                            subtitle={
                                "Collection events are the timepoints at which biomaterial is collected from a trial participant. These events, along with what sample types will be collected, should be specified in the clinical trial plan."
                            }
                        />
                    </Grid>
                    <Grid item>{dataSheet}</Grid>
                    <Grid item>
                        <Tooltip title="add a row" placement="bottom">
                            <IconButton
                                color="primary"
                                disabled={disableAddRow}
                                onClick={addRow}
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="remove last row" placement="bottom">
                            <IconButton
                                color="secondary"
                                disabled={disableRemoveRow}
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

export default CollectionEventsStep;
