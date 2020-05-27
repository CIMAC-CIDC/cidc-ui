import React from "react";
import { map } from "lodash";
import { useTrialFormContext } from "./TrialForm";
import { useForm, FormContext } from "react-hook-form";
import { Grid, IconButton, Tooltip, Select, MenuItem } from "@material-ui/core";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import { IGridElement, makeHeaderRow } from "./_FormStepDataSheet";
import { Add } from "@material-ui/icons";

const randomString = () =>
    `CIDC-${Math.random()
        .toString(36)
        .substring(2, 5)}-${Math.random()
        .toString(36)
        .substring(2, 5)}`;

const AddDerivativeButton: React.FC<{ handleClick: () => void }> = ({
    handleClick
}) => {
    return (
        <Tooltip title="Add a derivative biospecimen">
            <IconButton color="primary" size="small" onClick={handleClick}>
                <Add />
            </IconButton>
        </Tooltip>
    );
};

const makeEmptyRow = (
    participantId: string,
    collectionEvents: string[],
    parentSampleId?: string
) => {
    const eventSelect = (
        <Select fullWidth>
            {collectionEvents.map(event => (
                <MenuItem key={event} value={event}>
                    {event}
                </MenuItem>
            ))}
        </Select>
    );

    return [
        {
            readOnly: true,
            component: <AddDerivativeButton handleClick={() => null} />,
            forceComponent: true
        },
        { readOnly: true, value: participantId, header: true },
        { readOnly: true, value: randomString(), header: true },
        { readOnly: true, value: parentSampleId, header: true },
        {
            component: eventSelect,
            forceComponent: true
        },
        ...Array(2).fill({ value: "" })
    ];
};

const BiospecimensStep: React.FC = () => {
    const formInstance = useForm({ mode: "onBlur" });
    const { trial } = useTrialFormContext();
    const collectionEvents = map(
        trial.collection_event_matrix,
        "collection_event"
    );

    const rows = trial.participants.map((p: any) =>
        makeEmptyRow(p.cimac_participant_id, collectionEvents)
    );

    const [grid, setGrid] = React.useState<IGridElement[][]>([
        makeHeaderRow([
            "CIDC Participant ID",
            "CIDC Biospecimen ID",
            "Parent Biospecimen ID",
            "Collection Event",
            "Specimen Type",
            "Intended Assays (Comma-Delimited)"
        ]),
        ...rows
    ]);

    // eslint-disable-next-line
    const gridWithInteractions = grid.map((row: any[], rowNum: number) => {
        if (rowNum === 0) {
            return row;
        }

        const handleClick = () => {
            const firstHalf = grid.slice(0, rowNum + 1);
            const secondHalf = grid.slice(rowNum + 1);
            const newRow = makeEmptyRow(
                row[1].value,
                collectionEvents,
                row[2].value
            );
            setGrid([...firstHalf, newRow, ...secondHalf]);
        };

        const buttonCell = {
            readOnly: true,
            component: <AddDerivativeButton handleClick={handleClick} />,
            forceComponent: true
        };

        return [buttonCell, ...row.slice(1)];
    });

    // TODO: wire up react-hook-form
    // const dataSheet = (
    //     <FormStepDataSheet
    //         grid={gridWithInteractions}
    //         editableRegion={{ minRow: 1, minCol: 3 }}
    //         setGrid={setGrid}
    //         getCellName={({ row, col }) => ""}
    //         processCellValue={v => v}
    //         // onChangeListener={() => {
    //         //     // formInstance.triggerValidation(KEY_NME);
    //         // }}
    //     />
    // );

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
                            title="Define Biospecimens"
                            subtitle={
                                "Describe the biospecimens collected over the course of this trial. Each row in this table represents either a biospecimen derived directly from study participants (i.e., biospecimens with no parent) or a biospecimen derived from another biospecimen (i.e., biospecimens with a parent)."
                            }
                        />
                    </Grid>
                    {/* <Grid item>{dataSheet}</Grid> */}
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default BiospecimensStep;
