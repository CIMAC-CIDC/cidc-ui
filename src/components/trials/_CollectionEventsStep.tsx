import React from "react";
import { countBy, isEqual } from "lodash";
import { Grid } from "@material-ui/core";
import { useForm, FormContext } from "react-hook-form";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import { useTrialFormContext } from "./TrialForm";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow,
    IFormStepDataSheetProps,
    ICellWithLocation
} from "./_FormStepDataSheet";

const KEY_NAME = "collection_event_matrix";
const SAMPLE_TYPE_DELIMITER = ",";

interface ICollectionEvent {
    collection_event: string;
    sample_types: string[];
}

const attrToHeader = {
    collection_event: "Collection Event",
    sample_types: "Sample Types"
};

const colToAttr: IFormStepDataSheetProps<ICollectionEvent>["colToAttr"] = {
    1: "collection_event",
    2: "sample_types"
};

const makeRow = (row: number, event?: any) => {
    if (event) {
        return [
            { readOnly: true, value: row + 1 },
            { value: event.collection_event },
            { value: event.sample_types.join(SAMPLE_TYPE_DELIMITER) }
        ];
    } else {
        const values = Array(2).fill({ value: "" });
        return [{ readOnly: true, value: row }, ...values];
    }
};

const getCellName = ({ row, attr }: any) => `${KEY_NAME}[${row}].${attr}`;

const CollectionEventsStep: React.FC = () => {
    const { trial } = useTrialFormContext();
    const formInstance = useForm({ mode: "onBlur" });
    const { getValues } = formInstance;

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const headers = makeHeaderRow(...Object.values(attrToHeader));
        const defaultValues = trial[KEY_NAME];
        if (!!defaultValues && defaultValues.length > 0) {
            return [
                headers,
                ...defaultValues.map((e: any, r: number) => makeRow(r, e))
            ];
        } else {
            return [headers, makeRow(1)];
        }
    });

    const getCellValidation = ({
        attr
    }: ICellWithLocation<ICollectionEvent>) => {
        return (value: any) => {
            if (!value || isEqual(value, [""])) {
                return "This is a required field";
            }
            if (attr === "collection_event") {
                const events: ICollectionEvent[] = getValues({
                    nest: true
                })[KEY_NAME];
                const isUnique = countBy(events, attr)[value] === 1;
                return (
                    isUnique ||
                    `${attrToHeader.collection_event}s must be unique`
                );
            }
        };
    };

    const processCellValue = ({
        attr,
        value: v
    }: ICellWithLocation<ICollectionEvent>) => {
        switch (attr) {
            case "collection_event":
                return v;
            case "sample_types":
                const splitted = (v || "")
                    .toString()
                    .split(SAMPLE_TYPE_DELIMITER);
                const trimmed = splitted.map(s => s.trim());
                return trimmed;
            default:
                return v;
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
                            title="Define Collection Events"
                            subtitle={
                                "Collection events are the timepoints at which biomaterial is collected from a trial participant. These events, along with what sample types will be collected, should be specified in the clinical trial plan."
                            }
                        />
                    </Grid>
                    <Grid item>
                        <FormStepDataSheet<ICollectionEvent>
                            grid={grid}
                            setGrid={setGrid}
                            colToAttr={colToAttr}
                            rootObjectName={KEY_NAME}
                            getCellName={getCellName}
                            getCellValidation={getCellValidation}
                            processCellValue={processCellValue}
                            makeEmptyRow={makeRow}
                        />
                    </Grid>
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default CollectionEventsStep;
