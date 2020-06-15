import React from "react";
import { countBy } from "lodash";
import { useTrialFormContext, useTrialFormSaver } from "../TrialForm";
import { useForm, FormContext } from "react-hook-form";
import { Grid } from "@material-ui/core";
import FormStepHeader from "./FormStepHeader";
import FormStepFooter from "./FormStepFooter";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow,
    IFormStepDataSheetProps,
    ICellWithLocation
} from "./FormStepDataSheet";
import { generateParticipantID } from "./idGeneration";

const CIMAC_PARTICIPANT_ID_REGEX = /^C[A-Z0-9]{3}[A-Z0-9]{3}$/;

const KEY_NAME = "participants";

interface IParticipant {
    cidc_participant_id: string;
    cimac_participant_id: string;
    participant_id: string;
    cohort_name?: string;
}

const attrToHeader = {
    cidc_participant_id: "CIDC Participant ID",
    cimac_participant_id: "CIMAC Participant ID",
    participant_id: "Trial Participant ID",
    cohort_name: "Cohort Name"
};

const colToAttr: IFormStepDataSheetProps<IParticipant>["colToAttr"] = {
    0: "cidc_participant_id",
    1: "cimac_participant_id",
    2: "participant_id",
    3: "cohort_name"
};

const getCellName = ({ row, attr }: any) => `${KEY_NAME}[${row}].${attr}`;

const ParticipantsStep: React.FC = () => {
    const { trial, setHasChanged } = useTrialFormContext();
    const formInstance = useForm({ mode: "onChange" });
    const { getValues, handleSubmit } = formInstance;
    const getParticipants = () => getValues({ nest: true });

    useTrialFormSaver(getParticipants);

    const idSet = new Set<string>();
    const makeRow = (participant?: any) => {
        console.log(makeRow, participant);
        if (participant) {
            idSet.add(participant.cidc_participant_id);
            return [
                {
                    readOnly: true,
                    value: participant.cidc_participant_id,
                    header: true
                },
                { value: participant.cimac_participant_id },
                { value: participant.participant_id },
                { value: participant.cohort_name }
            ];
        } else {
            const cidcParticipantId = generateParticipantID(
                trial.protocol_identifier,
                idSet
            );
            idSet.add(cidcParticipantId);
            return [
                { readOnly: true, value: cidcParticipantId, header: true },
                { value: "" },
                { value: "" },
                { value: "" }
            ];
        }
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const headers = makeHeaderRow(Object.values(attrToHeader));
        const defaultValues = trial[KEY_NAME];
        if (!!defaultValues && defaultValues.length > 0) {
            return [
                headers,
                ...defaultValues.map((participant: IParticipant) =>
                    makeRow(participant)
                )
            ];
        } else {
            return [headers, makeRow()];
        }
    });

    const getCellValidation = ({ attr }: ICellWithLocation<IParticipant>) => {
        return (value: any) => {
            if (attr === "participant_id" && !value) {
                return "This is a required field";
            }
            if (attr === "cimac_participant_id" && !!value) {
                const invalidCimacId = !CIMAC_PARTICIPANT_ID_REGEX.test(value);
                if (invalidCimacId) {
                    return "Invalid CIMAC participant id";
                }
            }
            if (attr === "cohort_name" && !!value) {
                const unknownCohortName = !trial.allowed_cohort_names.includes(
                    value
                );
                if (unknownCohortName) {
                    return "Unknown cohort name";
                }
            }
            if (attr !== "cohort_name") {
                const participants: IParticipant[] = getValues({
                    nest: true
                })[KEY_NAME];
                const isUnique = countBy(participants, attr)[value] === 1;
                return isUnique || `${attrToHeader[attr]}s must be unique`;
            }
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
                            setGrid={g => {
                                setHasChanged(true);
                                setGrid(g);
                            }}
                            colToAttr={colToAttr}
                            getCellName={getCellName}
                            getCellValidation={getCellValidation}
                            rootObjectName={KEY_NAME}
                            processCellValue={v => v.value}
                            makeEmptyRow={() => makeRow()}
                        />
                    </Grid>
                </Grid>
                <FormStepFooter
                    backButton
                    nextButton
                    getValues={getParticipants}
                    handleSubmit={handleSubmit}
                />
            </form>
        </FormContext>
    );
};

export default ParticipantsStep;
