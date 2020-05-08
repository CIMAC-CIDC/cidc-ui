import React from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Grid,
    Card,
    CardHeader,
    Button
} from "@material-ui/core";
import { Trial } from "../../model/trial";
import { getTrials } from "../../api/api";
import { AuthContext } from "../identity/AuthProvider";
import { Add } from "@material-ui/icons";
import { History } from "history";
import { RouteComponentProps, withRouter } from "react-router-dom";
import TrailCreationDialog from "./TrialCreationDialog";

interface IWithHistory {
    history: History;
}

interface ITrialRowProps extends IWithHistory {
    trial: Trial;
}

const TrialRow: React.FC<ITrialRowProps> = ({ trial, history }) => {
    const navigateToEditForm = () => {
        history.push(`trials/edit/${trial.trial_id}`);
    };

    const org = trial.metadata_json.trial_organization;

    return (
        <TableRow hover onClick={navigateToEditForm}>
            <TableCell>{trial.trial_id}</TableCell>
            <TableCell>
                <Typography color={org ? "textPrimary" : "textSecondary"}>
                    {org || "none specified"}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

const AddNewTrialButton: React.FC = () => {
    const [openDialog, setOpenDialog] = React.useState<boolean>(false);

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                endIcon={<Add />}
                onClick={() => setOpenDialog(true)}
            >
                Create a New Trial
            </Button>
            <TrailCreationDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            />
        </>
    );
};

const TrialsTable: React.FC<RouteComponentProps> = ({ history }) => {
    const { idToken } = React.useContext(AuthContext)!;
    const [trials, setTrials] = React.useState<Trial[] | undefined>();

    React.useEffect(() => {
        getTrials(idToken).then(ts => setTrials(ts));
    });

    return (
        <Grid container direction="column">
            <Grid item>
                <Card>
                    <CardHeader
                        title={
                            <Grid container justify="space-between">
                                <Grid item>
                                    <Typography variant="h5">Trials</Typography>
                                </Grid>
                                <Grid item>
                                    <AddNewTrialButton />
                                </Grid>
                            </Grid>
                        }
                    />
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Procotol ID</TableCell>
                                <TableCell>Lead CIMAC</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trials !== undefined ? (
                                trials.length > 0 ? (
                                    trials.map(trial => (
                                        <TrialRow
                                            key={trial.id}
                                            trial={trial}
                                            history={history}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell>
                                            <Typography color="textSecondary">
                                                No trials found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            ) : (
                                <TableRow>
                                    <TableCell>
                                        <Typography color="textSecondary">
                                            Loading...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </Grid>
        </Grid>
    );
};

export default withRouter(TrialsTable);
