import React from "react";
import {
    invert,
    some,
    isEmpty,
    groupBy,
    map,
    mapValues,
    uniq,
    pick
} from "lodash";
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
} from "./FormStepDataSheet";
import { useTrialFormContext } from "../TrialForm";
import {
    useFormContext,
    FormContext,
    useForm,
    FormContextValues
} from "react-hook-form";
import { Close, Check } from "@material-ui/icons";
import { flattenCollectionEvents } from "./CollectionEventsStep";
import { generateBiospecimenID } from "./idGeneration";

const KEY_NAME = "biospecimens";

interface IWizardStepProps {
    nextStep: () => void;
}

interface IFlatBiospecimen {
    cidc_participant_id: string;
    participant_id: string;
    processed_sample_id: string;
    cidc_id: string;
    collection_event: string;
    type_of_sample: string;
    parent_sample_id: string;
    intended_assay: string;
}

const fullAttrToHeader: IFlatBiospecimen = {
    cidc_participant_id: "CIDC Participant ID",
    participant_id: "Trial Participant ID",
    processed_sample_id: "Trial Biospecimen ID",
    cidc_id: "CIDC Biospecimen ID",
    collection_event: "Collection Event",
    type_of_sample: "Specimen Type",
    parent_sample_id: "Parent Sample ID",
    intended_assay: "Intended Assay"
};

const fullColToAttr = Object.keys(fullAttrToHeader) as Array<
    keyof IFlatBiospecimen
>;

const getDataSheetConfig = (keys: Array<keyof IFlatBiospecimen>) => {
    const colToAttr = fullColToAttr.filter(attr => keys.includes(attr));
    const attrToCol = invert(colToAttr);
    const attrToHeader = pick(fullAttrToHeader, keys);

    return { colToAttr, attrToCol, attrToHeader };
};

const getCellName = (cell: any) => `${KEY_NAME}[${cell.row}].${cell.attr}`;

const ImportData: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const attrs: Array<keyof IFlatBiospecimen> = [
        "cidc_participant_id",
        "participant_id",
        "processed_sample_id"
    ];
    const { colToAttr, attrToCol, attrToHeader } = getDataSheetConfig(attrs);
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
                    rootObjectName={KEY_NAME}
                    getCellName={getCellName}
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

const getDefaultGrid = (
    getValues: FormContextValues["getValues"],
    attrToHeader: { [k: string]: string },
    makeRow: (spec: IFlatBiospecimen, ...args: any[]) => IGridElement[]
) => {
    const specimens = getValues({ nest: true })[KEY_NAME];
    return [
        makeHeaderRow(Object.values(attrToHeader)),
        ...specimens.map(makeRow)
    ];
};

const makeReadOnlyCells = (
    specimen: Partial<IFlatBiospecimen>,
    keys: Array<keyof IFlatBiospecimen>
) => {
    return keys.map(key => ({
        value: specimen[key] || "",
        readOnly: true,
        header: true
    }));
};

const AssignEvents: React.FC<IWizardStepProps> = ({ nextStep }) => {
    const attrs: Array<keyof IFlatBiospecimen> = [
        "cidc_participant_id",
        "participant_id",
        "processed_sample_id",
        "cidc_id",
        "collection_event"
    ];
    const { colToAttr, attrToCol, attrToHeader } = getDataSheetConfig(attrs);

    const { trial } = useTrialFormContext();
    const { getValues, errors } = useFormContext();

    const idSet = new Set<string>();
    const makeRow = (specimen: IFlatBiospecimen, row: number) => {
        let cidcId = specimen.cidc_id;
        if (!cidcId) {
            cidcId = generateBiospecimenID(specimen.cidc_participant_id, idSet);
        }
        idSet.add(cidcId);
        return [
            ...makeReadOnlyCells(
                { ...specimen, cidc_id: cidcId },
                attrs.slice(0, -1)
            ),
            { value: specimen.collection_event }
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(
        getDefaultGrid(getValues, attrToHeader, makeRow)
    );

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
                    rootObjectName={KEY_NAME}
                    getCellName={getCellName}
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
    const attrs: Array<keyof IFlatBiospecimen> = [
        "cidc_participant_id",
        "participant_id",
        "processed_sample_id",
        "cidc_id",
        "collection_event",
        "type_of_sample"
    ];
    const { colToAttr, attrToCol, attrToHeader } = getDataSheetConfig(attrs);

    const { trial } = useTrialFormContext();
    const { getValues, errors } = useFormContext();

    const flatCollectionEvents = flattenCollectionEvents(
        trial.collection_event_list
    );
    const sampleTypeMap = mapValues(
        groupBy(flatCollectionEvents, "event_name"),
        samples => map(samples, "specimen_type")
    );

    const makeRow = (specimen: IFlatBiospecimen, row: number) => {
        return [
            ...makeReadOnlyCells(specimen, attrs.slice(0, -1)),
            { value: specimen.type_of_sample }
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(
        getDefaultGrid(getValues, attrToHeader, makeRow)
    );

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
                    created earlier in this form.
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
                    rootObjectName={KEY_NAME}
                    getCellName={getCellName}
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
    const attrs: Array<keyof IFlatBiospecimen> = [
        "cidc_participant_id",
        "participant_id",
        "processed_sample_id",
        "cidc_id",
        "collection_event",
        "type_of_sample",
        "parent_sample_id"
    ];
    const { colToAttr, attrToCol, attrToHeader } = getDataSheetConfig(attrs);

    const { trial } = useTrialFormContext();
    const { getValues, setValue, register, errors } = useFormContext();

    const [specimens, dispatch] = React.useReducer(
        (state: any[], { type, payload }: any) => {
            switch (type) {
                case "setParentId":
                    const specimen = {
                        ...state[payload.rowNum],
                        parent_sample_id: payload.parentId
                    };
                    return [
                        ...state.slice(0, payload.rowNum),
                        specimen,
                        ...state.slice(payload.rowNum + 1)
                    ];
                case "addSpecimen":
                    return [...state, payload.specimen];
                default:
                    throw new Error("unhandled specimen update");
            }
        },
        getValues({ nest: true })[KEY_NAME]
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
                    specimens.filter(
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

    const idSet = new Set<string>();
    const makeRow = (specimen: Partial<IFlatBiospecimen>) => {
        if (specimen.cidc_id) {
            idSet.add(specimen.cidc_id);
        }
        return [
            ...makeReadOnlyCells(specimen, attrs.slice(0, -1)),
            { value: "" }
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(
        getDefaultGrid(getValues, attrToHeader, makeRow)
    );

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
                        value={specimens[rowNum].parent_sample_id || ""}
                        validParents={validParents || []}
                        onChange={parentId => {
                            dispatch({
                                type: "setParentId",
                                payload: { rowNum, parentId }
                            });
                        }}
                        createNewParent={() => {
                            const cidcId = generateBiospecimenID(
                                participantId,
                                idSet
                            );
                            idSet.add(cidcId);
                            const specimen = {
                                cidc_participant_id: participantId,
                                cidc_id: cidcId,
                                collection_event: collectionEvent,
                                type_of_sample: typeToParentType[specimenType]
                            };
                            setGrid([...grid, makeRow(specimen)]);
                            dispatch({
                                type: "addSpecimen",
                                payload: { specimen }
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
            specimens.map(
                specimen =>
                    !specimen.parent_sample_id &&
                    !rootSampleTypes.includes(specimen.type_of_sample)
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
                            register({ name: KEY_NAME });
                            setValue(KEY_NAME, specimens);
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
                    rootObjectName={KEY_NAME}
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
    const attrs: Array<keyof IFlatBiospecimen> = [
        "cidc_participant_id",
        "participant_id",
        "processed_sample_id",
        "cidc_id",
        "collection_event",
        "type_of_sample",
        "parent_sample_id",
        "intended_assay"
    ];
    const { colToAttr, attrToCol, attrToHeader } = getDataSheetConfig(attrs);
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

    const makeRow = (specimen: IFlatBiospecimen) => {
        const allowedAssaysCell =
            validAssayMap[specimen.type_of_sample] &&
            !!validAssayMap[specimen.type_of_sample][specimen.collection_event]
                ? { value: "" }
                : { value: "(none)", readOnly: true };
        return [
            ...makeReadOnlyCells(specimen, attrs.slice(0, -1)),
            allowedAssaysCell
        ];
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(
        getDefaultGrid(getValues, attrToHeader, makeRow)
    );

    const showAcceptIntendedAssays =
        isEmpty(errors) &&
        !some(grid.map(row => !row[attrToCol.intended_assay].value));

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    Add the intended assay for each of these biospecimens.
                    Intended assay types are restricted based on the specified
                    biospecimen type, according to the collection event plan
                    created earlier in this form.
                </Typography>
            </Grid>
            <Grid item>
                {showAcceptIntendedAssays && (
                    <Chip
                        variant="outlined"
                        color="primary"
                        icon={<Check />}
                        label="Congratulations! These biospecimens are valid."
                    ></Chip>
                )}
            </Grid>
            <Grid item>
                <FormStepDataSheet
                    grid={grid}
                    setGrid={setGrid}
                    colToAttr={colToAttr}
                    rootObjectName={KEY_NAME}
                    getCellName={getCellName}
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
                                            Check biospecimen constraints
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
