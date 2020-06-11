import React from "react";
import { invert, some, isEmpty, groupBy, map, mapValues, uniq } from "lodash";
import {
    Stepper,
    Step,
    StepLabel,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    Select,
    MenuItem,
    Chip
} from "@material-ui/core";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow
} from "./_FormStepDataSheet";
import { useTrialFormContext } from "./TrialForm";
import { useFormContext, FormContext, useForm } from "react-hook-form";
import { Close } from "@material-ui/icons";
import { flattenCollectionEvents } from "./_CollectionEventsStep";

interface IWizardStepProps {
    nextStep: () => void;
}

const ImportData: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const rootObjectName = "participants";
    const colToAttr = {
        0: "cidc_participant_id",
        1: "participant_id",
        2: "processed_sample_id"
    };
    const attrToHeader = {
        cidc_participant_id: "CIDC Participant ID",
        participant_id: "Trial Participant ID",
        processed_sample_id: "Trial Biospecimen ID"
    };
    const attrToCol = invert(colToAttr);
    const makeEmptyRow = () => {
        return [
            { value: "", readOnly: true, header: true },
            ...Array(2).fill({ value: "" })
        ];
    };

    const { errors } = useFormContext();

    const [grid, setGrid] = React.useState<IGridElement[][]>([
        makeHeaderRow(Object.values(attrToHeader)),
        makeEmptyRow()
    ]);

    const { trial } = useTrialFormContext();
    const idMap = trial.participants.reduce(
        (mapping: any, p: any) => ({
            ...mapping,
            [p.participant_id]: p.cidc_participant_id
        }),
        {}
    );

    const gridWithMappedIds = grid.map((row, rowNum) => {
        if (rowNum > 0) {
            const trialParticipantId = row[attrToCol.participant_id].value;
            row[attrToCol.cidc_participant_id].value =
                idMap[trialParticipantId];
            return row;
        }
        return row;
    });
    const showAcceptMapping =
        isEmpty(errors) &&
        !some(grid.map(row => !row[attrToCol.participant_id].value));

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography>
                    Paste in a list of participant and biospecimen identifiers
                    provided by the biobank. These participant identifiers
                    should match up with "Trial Participant Identifiers" already
                    entered into the CIDC for this trial.
                </Typography>
            </Grid>
            <Grid item>
                {showAcceptMapping && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => nextStep()}
                    >
                        Accept Participant ID Mapping
                    </Button>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={gridWithMappedIds}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={rootObjectName}
                    getCellName={cell =>
                        `${rootObjectName}[${cell.row}].${cell.attr}`
                    }
                    getCellValidation={({ attr }) => value => {
                        if (!value) {
                            return "This is a required field";
                        }
                        if (attr === "participant_id") {
                            if (!(value in idMap)) {
                                return "unknown participant id";
                            }
                        }
                    }}
                    processCellValue={cell => cell.value}
                    makeEmptyRow={makeEmptyRow}
                />
            </Grid>
        </Grid>
    );
};

const makeFakeCIDCid = (participantId: string) => {
    return `${participantId}-${Math.random()
        .toString(36)
        .substring(2, 5)}`;
};

const AssignEvents: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const rootObjectName = "participants";
    const colToAttr = {
        0: "cidc_participant_id",
        1: "participant_id",
        2: "processed_sample_id",
        3: "cidc_id",
        4: "collection_event"
    };
    const attrToHeader = {
        cidc_participant_id: "CIDC Participant ID",
        participant_id: "Trial Participant ID",
        processed_sample_id: "Trial Biospecimen ID",
        cidc_id: "CIDC Biospecimen ID",
        collection_event: "Collection Event"
    };
    const attrToCol = invert(colToAttr);

    const { trial } = useTrialFormContext();
    const { getValues, errors } = useFormContext();

    const makeRow = (p: any, row: number) => {
        return [
            { value: p.cidc_participant_id, readOnly: true, header: true },
            { value: p.participant_id, readOnly: true, header: true },
            { value: p.processed_sample_id, readOnly: true, header: true },
            {
                value: makeFakeCIDCid(p.cidc_participant_id),
                readOnly: true,
                header: true
            },
            { value: p.collection_event }
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const participants = getValues({ nest: true })[rootObjectName];
        return [
            makeHeaderRow(Object.values(attrToHeader)),
            ...participants.map(makeRow)
        ];
    });

    const eventNames: string[] = trial.collection_event_list.map(
        (e: any) => e.event_name
    );

    const showAcceptCollectionEvents =
        isEmpty(errors) &&
        !some(grid.map(row => !row[attrToCol.collection_event].value));

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    Add a collection event for each biospecimen. Only collection
                    events that have been previously specified on the
                    "Collection Events" step of this form are allowed.
                </Typography>
                <Typography gutterBottom>
                    The valid collection events for this trial are:{" "}
                    {eventNames.map((event, i) => (
                        <Chip
                            key={event}
                            style={{ marginLeft: ".3rem" }}
                            label={event}
                            variant="outlined"
                        />
                    ))}
                </Typography>
            </Grid>
            <Grid item>
                {showAcceptCollectionEvents && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => nextStep()}
                    >
                        Accept Collection Events
                    </Button>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={grid}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={rootObjectName}
                    getCellName={cell =>
                        `${rootObjectName}[${cell.row}].${cell.attr}`
                    }
                    getCellValidation={({ attr }) => value => {
                        if (!value) {
                            return "This is a required field";
                        }
                        if (attr === "collection_event") {
                            if (!eventNames.includes(value)) {
                                return `Invalid collection event: must be one of '${eventNames.join(
                                    "', '"
                                )}'`;
                            }
                        }
                    }}
                    processCellValue={cell => cell.value}
                />
            </Grid>
        </Grid>
    );
};

const AssignSpecimenTypes: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const rootObjectName = "participants";
    const colToAttr = {
        0: "cidc_participant_id",
        1: "participant_id",
        2: "processed_sample_id",
        3: "cidc_id",
        4: "collection_event",
        5: "type_of_sample"
    };
    const attrToHeader = {
        cidc_participant_id: "CIDC Participant ID",
        participant_id: "Trial Participant ID",
        processed_sample_id: "Trial Biospecimen ID",
        cidc_id: "CIDC Biospecimen ID",
        collection_event: "Collection Event",
        type_of_sample: "Specimen Type"
    };
    const attrToCol = invert(colToAttr);

    const { trial } = useTrialFormContext();
    const { getValues, errors } = useFormContext();

    const flatCollectionEvents = flattenCollectionEvents(
        trial.collection_event_list
    );
    const sampleTypeMap = mapValues(
        groupBy(flatCollectionEvents, "event_name"),
        samples => map(samples, "specimen_type")
    );

    const makeRow = (p: any, row: number) => {
        return [
            { value: p.cidc_participant_id, readOnly: true, header: true },
            { value: p.participant_id, readOnly: true, header: true },
            { value: p.processed_sample_id, readOnly: true, header: true },
            { value: p.cidc_id, readOnly: true, header: true },
            { value: p.collection_event, readOnly: true, header: true },
            { value: p.type_of_sample }
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const participants = getValues({ nest: true })[rootObjectName];
        return [
            makeHeaderRow(Object.values(attrToHeader)),
            ...participants.map(makeRow)
        ];
    });

    const showAcceptSpecimenTypes =
        isEmpty(errors) &&
        !some(grid.map(row => !row[attrToCol.type_of_sample].value));

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    Add a specimen type for each of these biospecimens.
                    Biospecimen types are restricted based on their specified
                    collection event, according to the collection event plan
                    specified earlier in this form.
                </Typography>
                {map(sampleTypeMap, (types, event) => (
                    <Typography key={event} gutterBottom>
                        Allowed types for <strong>{event}</strong>:
                        {types.map(specimenType => (
                            <Chip
                                key={specimenType}
                                style={{ marginLeft: ".3rem" }}
                                label={specimenType}
                                variant="outlined"
                            />
                        ))}
                    </Typography>
                ))}
            </Grid>
            <Grid item>
                {showAcceptSpecimenTypes && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => nextStep()}
                    >
                        Accept Specimen Types
                    </Button>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={grid}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={rootObjectName}
                    getCellName={cell =>
                        `${rootObjectName}[${cell.row}].${cell.attr}`
                    }
                    getCellValidation={({ attr, row }) => value => {
                        if (!value) {
                            return "This is a required field";
                        }
                        if (attr === "type_of_sample") {
                            const event =
                                grid[row + 1][attrToCol.collection_event].value;
                            const allowedTypes = sampleTypeMap[event];
                            if (!allowedTypes.includes(value)) {
                                return `Invalid specimen type: must be one of '${allowedTypes.join(
                                    "', '"
                                )}'`;
                            }
                        }
                    }}
                    processCellValue={cell => cell.value}
                />
            </Grid>
        </Grid>
    );
};

const noParentText = "(none)";
const createNewParentText = "Add a latent parent specimen";

const ParentSelector: React.FC<{
    value: string;
    validParents: string[];
    onChange: (parentId: string) => void;
    createNewParent: () => string;
}> = ({ value, validParents, createNewParent, onChange }) => {
    return (
        <Select
            fullWidth
            value={value}
            onChange={e => {
                let newValue = e.target.value as string;
                if (newValue === createNewParentText) {
                    newValue = createNewParent();
                }
                onChange(newValue);
            }}
        >
            {validParents.map(parentId => (
                <MenuItem key={parentId} value={parentId}>
                    {parentId}
                </MenuItem>
            ))}
            <MenuItem value={createNewParentText}>
                {createNewParentText}
            </MenuItem>
        </Select>
    );
};

const AssignParentSpecimens: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const rootObjectName = "participants";
    const colToAttr = {
        0: "cidc_participant_id",
        1: "participant_id",
        2: "processed_sample_id",
        3: "cidc_id",
        4: "collection_event",
        5: "type_of_sample",
        6: "parent_sample_id"
    };
    const attrToHeader = {
        cidc_participant_id: "CIDC Participant ID",
        participant_id: "Trial Participant ID",
        processed_sample_id: "Trial Biospecimen ID",
        cidc_id: "CIDC Biospecimen ID",
        collection_event: "Collection Event",
        type_of_sample: "Specimen Type",
        parent_sample_id: "Parent Sample ID"
    };
    const attrToCol = invert(colToAttr);

    const { trial } = useTrialFormContext();
    const { getValues, setValue, register, errors } = useFormContext();

    const [participants, dispatch] = React.useReducer(
        (state: any[], { type, payload }: any) => {
            switch (type) {
                case "setParentId":
                    const participant = {
                        ...state[payload.rowNum],
                        parent_sample_id: payload.parentId
                    };
                    return [
                        ...state.slice(0, payload.rowNum),
                        participant,
                        ...state.slice(payload.rowNum + 1)
                    ];
                case "addParticipant":
                    return [...state, payload.participant];
                default:
                    throw new Error("unhandled participant update");
            }
        },
        getValues({ nest: true })[rootObjectName]
    );

    const rootSampleTypes: string[] = uniq(
        trial.collection_event_list.flatMap((event: any) =>
            event.specimen_types.map((t: any) => t.specimen_type)
        )
    );
    const flatCollectionEvents = flattenCollectionEvents(
        trial.collection_event_list
    );
    const typeToParentType = flatCollectionEvents.reduce(
        (typeMap, event) => ({
            ...typeMap,
            [event.specimen_type]: event.parent_specimen_type
        }),
        {}
    );
    const validParentMap = flatCollectionEvents.reduce(
        (typeMap, event) => ({
            ...typeMap,
            [event.specimen_type]: mapValues(
                groupBy(
                    participants.filter(
                        (p: any) =>
                            p.type_of_sample === event.parent_specimen_type
                    ),
                    "cidc_participant_id"
                ),
                parts =>
                    mapValues(groupBy(parts, "collection_event"), (ps: any[]) =>
                        map(ps, "cidc_id")
                    )
            )
        }),
        {}
    );

    const makeRow = (p: any) => {
        return [
            { value: p.cidc_participant_id, readOnly: true, header: true },
            { value: p.participant_id, readOnly: true, header: true },
            { value: p.processed_sample_id, readOnly: true, header: true },
            { value: p.cidc_id, readOnly: true, header: true },
            { value: p.collection_event, readOnly: true, header: true },
            { value: p.type_of_sample, readOnly: true, header: true },
            { value: "" }
        ];
    };

    const getCellName = (cell: any) =>
        `${rootObjectName}[${cell.row}].${String(cell.attr)}`;

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        return [
            makeHeaderRow(Object.values(attrToHeader)),
            ...participants.map(makeRow)
        ];
    });

    grid.forEach((row, rowNumWithHeader) => {
        if (rowNumWithHeader === 0) {
            return;
        }
        const rowNum = rowNumWithHeader - 1;
        const specimenType = row[attrToCol.type_of_sample].value;
        let newCell;
        if (rootSampleTypes.includes(specimenType)) {
            newCell = {
                value: noParentText,
                readOnly: true
            };
        } else {
            const participantId = row[attrToCol.cidc_participant_id].value;
            const collectionEvent = row[attrToCol.collection_event].value;
            const validParents =
                validParentMap[specimenType] &&
                validParentMap[specimenType][participantId] &&
                validParentMap[specimenType][participantId][collectionEvent];
            newCell = {
                value: "",
                component: (
                    <ParentSelector
                        value={participants[rowNum].parent_sample_id || ""}
                        validParents={validParents || []}
                        onChange={parentId => {
                            dispatch({
                                type: "setParentId",
                                payload: { rowNum, parentId }
                            });
                        }}
                        createNewParent={() => {
                            const cidcId = makeFakeCIDCid(participantId);
                            const participant = {
                                cidc_participant_id: participantId,
                                cidc_id: cidcId,
                                collection_event: collectionEvent,
                                type_of_sample: typeToParentType[specimenType]
                            };
                            setGrid([...grid, makeRow(participant)]);
                            dispatch({
                                type: "addParticipant",
                                payload: { participant }
                            });
                            return cidcId;
                        }}
                    />
                ),
                forceComponent: true
            };
        }
        row[attrToCol.parent_sample_id] = newCell;
    });

    const showAcceptParentSamples =
        isEmpty(errors) &&
        !some(
            participants.map(
                participant =>
                    !participant.parent_sample_id &&
                    !rootSampleTypes.includes(participant.type_of_sample)
            )
        );

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    Assign parent biospecimens for each listed biospecimen.
                    Allowed parents for a given specimen are restricted by that
                    specimen's type according to the collection event plan
                    specified previously in this form.
                </Typography>
                <Typography gutterBottom>
                    If a parent specimen of the appropriate type was not
                    documented by the biobank (i.e., it does not appear in the
                    table below), you will need to create a new "latent"
                    specimen.
                </Typography>
                <Typography gutterBottom>
                    These specimen types do not allow parents:
                    {rootSampleTypes.map(specimenType => (
                        <Chip
                            key={specimenType}
                            style={{ marginLeft: ".3rem" }}
                            label={specimenType}
                            variant="outlined"
                        />
                    ))}
                </Typography>
            </Grid>
            <Grid item>
                {showAcceptParentSamples && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            register({ name: rootObjectName });
                            setValue(rootObjectName, participants);
                            nextStep();
                        }}
                    >
                        Accept Parent Samples
                    </Button>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={grid}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={rootObjectName}
                    getCellName={getCellName}
                    processCellValue={cell =>
                        cell.value === noParentText ? "" : cell.value
                    }
                />
            </Grid>
        </Grid>
    );
};

const AssignAssays: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const rootObjectName = "participants";
    const colToAttr = {
        0: "cidc_participant_id",
        1: "participant_id",
        2: "processed_sample_id",
        3: "cidc_id",
        4: "collection_event",
        5: "type_of_sample",
        6: "parent_sample_id",
        7: "intended_assay"
    };
    const attrToHeader = {
        cidc_participant_id: "CIDC Participant ID",
        participant_id: "Trial Participant ID",
        processed_sample_id: "Trial Biospecimen ID",
        cidc_id: "CIDC Biospecimen ID",
        collection_event: "Collection Event",
        type_of_sample: "Specimen Type",
        parent_sample_id: "Parent Sample ID",
        intended_assay: "Intended Assay"
    };
    const attrToCol = invert(colToAttr);

    const { trial } = useTrialFormContext();
    const { getValues, errors } = useFormContext();

    const flatCollectionEvents = flattenCollectionEvents(
        trial.collection_event_list
    );
    const validAssayMap = flatCollectionEvents.reduce(
        (typeMap, event) => ({
            ...typeMap,
            [event.specimen_type]: {
                ...typeMap[event.specimen_type],
                [event.event_name]: event.intended_assays
            }
        }),
        {}
    );

    const makeRow = (p: any) => {
        const allowedAssaysCell =
            validAssayMap[p.type_of_sample] &&
            !!validAssayMap[p.type_of_sample][p.collection_event]
                ? { value: "" }
                : { value: "(none)", readOnly: true };
        return [
            { value: p.cidc_participant_id, readOnly: true, header: true },
            { value: p.participant_id, readOnly: true, header: true },
            { value: p.processed_sample_id, readOnly: true, header: true },
            { value: p.cidc_id, readOnly: true, header: true },
            { value: p.collection_event, readOnly: true, header: true },
            { value: p.type_of_sample, readOnly: true, header: true },
            { value: p.parent_sample_id, readOnly: true, header: true },
            allowedAssaysCell
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const participants = getValues({ nest: true })[rootObjectName];
        return [
            makeHeaderRow(Object.values(attrToHeader)),
            ...participants.map(makeRow)
        ];
    });

    const showAcceptIntendedAssays =
        isEmpty(errors) &&
        !some(grid.map(row => !row[attrToCol.intended_assay].value));

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    Add a specimen type for each of these biospecimens.
                    Biospecimen types are restricted based on their specified
                    collection event, according to the collection event plan
                    specified earlier in this form.
                </Typography>
                {/* {map(sampleTypeMap, (types, event) => (
                    <Typography key={event} gutterBottom>
                        Allowed types for <strong>{event}</strong>:
                        {types.map(specimen_type => (
                            <Chip
                                key={specimen_type}
                                style={{ marginLeft: ".3rem" }}
                                label={specimen_type}
                                variant="outlined"
                            />
                        ))}
                    </Typography>
                ))} */}
            </Grid>
            <Grid item>
                {showAcceptIntendedAssays && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => nextStep()}
                    >
                        Accept Intended Assays And Commit Samples To Trial
                    </Button>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={grid}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={rootObjectName}
                    getCellName={cell =>
                        `${rootObjectName}[${cell.row}].${cell.attr}`
                    }
                    getCellValidation={({ attr, row }) => value => {
                        if (!value) {
                            return "This is a required field";
                        }
                        if (attr === "intended_assay") {
                            const event =
                                grid[row + 1][attrToCol.collection_event].value;
                            const type =
                                grid[row + 1][attrToCol.type_of_sample].value;
                            const allowedAssays = validAssayMap[type][event];
                            if (
                                allowedAssays &&
                                !allowedAssays.includes(value)
                            ) {
                                return `Invalid intended assay: must be one of '${allowedAssays.join(
                                    "', '"
                                )}'`;
                            }
                        }
                    }}
                    processCellValue={cell => cell.value}
                />
            </Grid>
        </Grid>
    );
};

export interface IBiospecimensWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

const BiospecimensWizard: React.FC<IBiospecimensWizardProps> = ({
    onComplete,
    onCancel
}) => {
    const formInstance = useForm({ mode: "onBlur" });
    const [activeStep, setActiveStep] = React.useState<number>(0);

    const steps = [
        <ImportData nextStep={() => setActiveStep(1)} />,
        <AssignEvents nextStep={() => setActiveStep(2)} />,
        <AssignSpecimenTypes nextStep={() => setActiveStep(3)} />,
        <AssignParentSpecimens nextStep={() => setActiveStep(4)} />,
        <AssignAssays nextStep={() => onComplete()} />
    ];

    return (
        <FormContext {...formInstance}>
            <form>
                <Card>
                    <CardContent>
                        <Grid container direction="column">
                            <Grid item>
                                <Grid
                                    container
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <Typography variant="h6">
                                            Add new biospecimens
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            size="small"
                                            onClick={() => onCancel()}
                                        >
                                            <Close />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Stepper activeStep={activeStep}>
                                    <Step>
                                        <StepLabel>Import Data</StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>Assign Events</StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>
                                            Assign Specimen Types
                                        </StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>
                                            Assign Parent Specimens
                                        </StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>Assign Assays</StepLabel>
                                    </Step>
                                </Stepper>
                            </Grid>
                            <Grid item>{steps[activeStep]}</Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </form>
        </FormContext>
    );
};

export default BiospecimensWizard;
