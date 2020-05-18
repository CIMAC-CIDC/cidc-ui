import React from "react";
import { countBy } from "lodash";
import { useTrialFormContext } from "./TrialForm";
import { useForm, FormContext } from "react-hook-form";
import { Grid } from "@material-ui/core";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow,
    IFormStepDataSheetProps,
    ICellWithLocation
} from "./_FormStepDataSheet";

const randomString = () =>
    `CIDC-${Math.random()
        .toString(36)
        .substring(2, 5)}`;

const KEY_NAME = "participants";

interface IParticipant {
    cimac_participant_id: string;
    participant_id: string;
}

const attrToHeader = {
    cidc_participant_id: "CIDC Participant ID",
    cimac_participant_id: "CIMAC Participant ID",
    participant_id: "Trial Participant ID"
};

const colToAttr: IFormStepDataSheetProps<IParticipant>["colToAttr"] = {
    2: "cimac_participant_id",
    3: "participant_id"
};

const getCellName = ({ row, attr }: any) => `${KEY_NAME}[${row}].${attr}`;

const makeRow = (row: number, participant?: any) => {
    if (participant) {
        return [
            { readOnly: true, value: row + 1 },
            { readOnly: true, value: randomString(), header: true },
            { value: participant.cimac_participant_id },
            { value: participant.participant_id }
        ];
    } else {
        return [
            { readOnly: true, value: row },
            { readOnly: true, value: randomString(), header: true },
            { value: "" },
            { value: "" }
        ];
    }
};

const ParticipantsStep: React.FC = () => {
    const { trial } = useTrialFormContext();
    const formInstance = useForm({ mode: "onChange" });
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

    const getCellValidation = ({ attr }: ICellWithLocation<IParticipant>) => {
        return (value: any) => {
            if (!value) {
                return "This is a required field";
            }
            const participants: IParticipant[] = getValues({
                nest: true
            })[KEY_NAME];
            const isUnique = countBy(participants, attr)[value] === 1;
            return isUnique || `${attrToHeader[attr]}s must be unique`;
        };
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
                            title="Define Trial Participants"
                            subtitle="List identifiers for all participants in this trial. Please include all trial-specific local participant identifiers in addition to CIMAC global identifiers."
                        />
                    </Grid>
                    <Grid item>
                        <FormStepDataSheet<IParticipant>
                            grid={grid}
                            setGrid={setGrid}
                            colToAttr={colToAttr}
                            getCellName={getCellName}
                            getCellValidation={getCellValidation}
                            rootObjectName={KEY_NAME}
                            processCellValue={v => v.value}
                            makeEmptyRow={makeRow}
                        />
                    </Grid>
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default ParticipantsStep;
