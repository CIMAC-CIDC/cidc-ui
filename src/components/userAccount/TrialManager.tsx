import React from "react";
import { getTrials, updateTrialMetadata } from "../../api/api";
import { Trial } from "../../model/trial";
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
    TextField
} from "@material-ui/core";
import { LibraryAdd, Edit, Add, Check, Clear } from "@material-ui/icons";

export interface ITrialManagerProps {
    token: string;
}

const TrialManager: React.FC<ITrialManagerProps> = ({ token }) => {
    const [trials, setTrials] = React.useState<Trial[] | null>();
    React.useEffect(() => {
        getTrials(token).then(setTrials);
    }, [token]);

    const handleUpdate = (trial: Trial) => {
        updateTrialMetadata(token, trial._etag, trial).then(() =>
            getTrials(token).then(setTrials)
        );
    };

    return trials ? (
        <Card>
            <CardHeader
                avatar={<LibraryAdd />}
                title={<Typography variant="h6">Manage Trials</Typography>}
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
                        <IconButton color="primary" onClick={() => saveEdits()}>
                            <Check />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={() => clearEdits()}
                        >
                            <Clear />
                        </IconButton>
                    </ButtonGroup>
                ) : (
                    <IconButton onClick={() => setEditing(true)}>
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
                        <TextField
                            label="New Value"
                            variant="outlined"
                            value={newValue}
                            onChange={e => setNewValue(e.target.value)}
                        />
                        <IconButton type="submit">
                            <Add />
                        </IconButton>
                    </form>
                </Grid>
            )}
        </Grid>
    );
};

export default TrialManager;
