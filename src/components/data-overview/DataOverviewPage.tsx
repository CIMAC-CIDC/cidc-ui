import React from "react";
import sortBy from "lodash/sortBy";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Grid,
    Typography,
    Card,
    CardContent,
    withStyles
} from "@material-ui/core";
import { withIdToken } from "../identity/AuthProvider";
import { ITrialOverview } from "../../model/trial";
import useSWR from "swr";
import Loader from "../generic/Loader";
import { RouteComponentProps } from "react-router";
import { useRootStyles } from "../../rootStyles";
import { formatFileSize } from "../../util/formatters";

const friendlyAssayNames = {
    hande: "h&e"
};

const HeaderCell = withStyles({
    root: {
        textTransform: "uppercase",
        fontWeight: "bold"
    }
})(TableCell);

export const DataOverviewTable: React.FC = withIdToken(({ token }) => {
    const { data } = useSWR<ITrialOverview[]>([
        "/trial_metadata/summaries",
        token
    ]);

    if (data === undefined) {
        return (
            <Grid container justify="center">
                <Grid item>
                    <Loader />
                </Grid>
            </Grid>
        );
    }

    if (data.length === 0) {
        return <Typography>No data found.</Typography>;
    }

    const assays = Object.keys(data[0]).filter(
        k => !["trial_id", "file_size_bytes"].includes(k)
    );

    // List the trials with the most data first
    const sortedData = sortBy(data, "file_size_bytes").reverse();

    return (
        <Card>
            <CardContent>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{ borderBottom: 0 }}
                                colSpan={2}
                            />
                            <TableCell colSpan={assays.length} align="center">
                                # of Samples per Assay
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <HeaderCell>Protocol ID</HeaderCell>
                            <HeaderCell>Total Data Ingested</HeaderCell>
                            {assays.map(assay => (
                                <HeaderCell key={assay}>
                                    {friendlyAssayNames[assay] || assay}
                                </HeaderCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map(row => (
                            <TableRow key={row.trial_id}>
                                <TableCell>{row.trial_id}</TableCell>
                                <TableCell align="right">
                                    {formatFileSize(row.file_size_bytes)}
                                </TableCell>
                                {assays.map(assay => (
                                    <TableCell key={assay} align="right">
                                        {row[assay] || "-"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
});

const DataOverviewPage: React.FC<RouteComponentProps> = props => {
    const classes = useRootStyles();

    return (
        <Grid
            container
            className={classes.centeredPage}
            justify="center"
            alignItems="center"
        >
            <Grid item>
                <DataOverviewTable />
            </Grid>
        </Grid>
    );
};

export default DataOverviewPage;
