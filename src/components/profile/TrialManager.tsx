import React from "react";
import { getTrials, updateTrialMetadata, createTrial } from "../../api/api";
import { Trial, NewTrial } from "../../model/trial";
import {
    Card,
    CardHeader,
    Typography,
    CardContent,
    Grid,
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    IconButton,
    Chip,
    ButtonGroup,
    TextField,
    Button
} from "@material-ui/core";
import { LibraryAdd, Edit, Add } from "@material-ui/icons";

export interface ITrialManagerProps {
    token: string;
}

const TrialManager: React.FC<ITrialManagerProps> = ({ token }) => {
    const [trials, setTrials] = React.useState<Trial[] | null>();
    const [creating, setCreating] = React.useState<boolean>(false);

    React.useEffect(() => {
        getTrials(token).then(setTrials);
    }, [token]);

    const handleUpdate = (trial: Trial) => {
        updateTrialMetadata(token, trial._etag, trial).then(() =>
            getTrials(token).then(setTrials)
        );
    };

    const handleCreate = (trial: Omit<Omit<Trial, "_etag">, "id">) => {
        createTrial(token, trial).then(() => {
            setCreating(false);
            getTrials(token).then(setTrials);
        });
    };

    return trials ? (
        <Card>
            <CardHeader
                avatar={<LibraryAdd />}
                title={
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h6">Manage Trials</Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                endIcon={<Add />}
                                onClick={() => setCreating(true)}
                            >
                                Add New Trial
                            </Button>
                        </Grid>
                    </Grid>
                }
            />
            <CardContent>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Protocol Identifier</TableCell>
                            <TableCell>Allowed Cohort Names</TableCell>
                            <TableCell>
                                Allowed Collection Event Names
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {creating && (
                            <NewTrialTableRow
                                onCreate={t => handleCreate(t)}
                                onCancel={() => setCreating(false)}
                            />
                        )}
                        {trials.map(trial => (
                            <TrialTableRow
                                key={trial.trial_id}
                                trial={trial}
                                onChange={t => handleUpdate(t)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    ) : null;
};

interface INewTrialTableRowProps {
    onCreate: (trial: NewTrial) => void;
    onCancel: () => void;
}

const NewTrialTableRow: React.FC<INewTrialTableRowProps> = ({
    onCreate,
    onCancel
}) => {
    const [trialId, setTrialId] = React.useState<string>("");
    const [cohortNames, setCohortNames] = React.useState<string[]>([]);
    const [collectionEvents, setCollectionEvents] = React.useState<string[]>(
        []
    );

    const handleCreate = () => {
        const trial = {
            trial_id: trialId,
            metadata_json: {
                participants: [],
                protocol_identifier: trialId,
                allowed_collection_event_names: collectionEvents,
                allowed_cohort_names: cohortNames
            }
        };
        onCreate(trial);
    };

    const isValid = trialId && cohortNames && collectionEvents;

    return (
        <TableRow>
            <TableCell>
                <TextField
                    variant="outlined"
                    label="Protocol Identifier"
                    value={trialId}
                    onChange={e => setTrialId(e.target.value)}
                />
            </TableCell>
            <TableCell>
                <EditableList
                    editing={true}
                    values={cohortNames}
                    onChange={names => setCohortNames(names)}
                />
            </TableCell>
            <TableCell>
                <EditableList
                    editing={true}
                    values={collectionEvents}
                    onChange={events => setCollectionEvents(events)}
                />
            </TableCell>
            <TableCell>
                <ButtonGroup>
                    <Button
                        color="primary"
                        variant="contained"
                        disabled={!isValid}
                        onClick={() => handleCreate()}
                    >
                        Create
                    </Button>
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => onCancel()}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </TableCell>
        </TableRow>
    );
};

interface ITrialTableRowProps {
    trial: Trial;
    onChange: (trial: Trial) => void;
}

const TrialTableRow: React.FC<ITrialTableRowProps> = ({ trial, onChange }) => {
    const [editing, setEditing] = React.useState<boolean>(false);
    const [cohortNames, setCohortNames] = React.useState<string[]>(
        trial.metadata_json.allowed_cohort_names
    );
    const [collectionEvents, setCollectionEvents] = React.useState<string[]>(
        trial.metadata_json.allowed_collection_event_names
    );

    const clearEdits = () => {
        setEditing(false);
        setCohortNames(trial.metadata_json.allowed_cohort_names);
        setCollectionEvents(trial.metadata_json.allowed_collection_event_names);
    };

    const saveEdits = () => {
        const newTrial = {
            ...trial,
            metadata_json: {
                ...trial.metadata_json,
                allowed_cohort_names: cohortNames,
                allowed_collection_event_names: collectionEvents
            }
        };
        onChange(newTrial);
        setEditing(false);
    };

    return (
        <TableRow>
            <TableCell>{trial.trial_id}</TableCell>
            <TableCell>
                <EditableList
                    editing={editing}
                    values={cohortNames}
                    onChange={names => setCohortNames(names)}
                />
            </TableCell>
            <TableCell>
                <EditableList
                    editing={editing}
                    values={collectionEvents}
                    onChange={events => setCollectionEvents(events)}
                />
            </TableCell>
            <TableCell>
                {editing ? (
                    <ButtonGroup>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => saveEdits()}
                        >
                            Update
                        </Button>
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={() => clearEdits()}
                        >
                            Cancel
                        </Button>
                    </ButtonGroup>
                ) : (
                    <IconButton onClick={() => setEditing(true)} size="small">
                        <Edit />
                    </IconButton>
                )}
            </TableCell>
        </TableRow>
    );
};

interface IEditableListProps {
    editing: boolean;
    values: string[];
    onChange: (values: string[]) => void;
}

const EditableList: React.FC<IEditableListProps> = ({
    editing,
    values,
    onChange
}) => {
    const [newValue, setNewValue] = React.useState<string>("");

    return (
        <Grid container spacing={1} alignItems="center">
            {editing
                ? values.map(value => (
                      <Grid item key={value}>
                          <Chip
                              label={value}
                              onDelete={() =>
                                  onChange(values.filter(v => v !== value))
                              }
                          />
                      </Grid>
                  ))
                : values.join(", ")}
            {editing && (
                <Grid item>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            onChange([...values, newValue]);
                            setNewValue("");
                        }}
                    >
                        <Grid container alignItems="center" wrap="nowrap">
                            <Grid item>
                                <TextField
                                    label="New Value"
                                    variant="outlined"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                />
                            </Grid>
                            <Grid item>
                                <IconButton type="submit">
                                    <Add />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            )}
        </Grid>
    );
};

export default TrialManager;
