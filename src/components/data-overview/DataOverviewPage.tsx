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
    withStyles,
    Chip
} from "@material-ui/core";
import { withIdToken } from "../identity/AuthProvider";
import { ITrialOverview } from "../../model/trial";
import useSWR from "swr";
import Loader from "../generic/Loader";
import { RouteComponentProps } from "react-router";
import { useRootStyles } from "../../rootStyles";
import { formatFileSize } from "../../util/utils";
import { IDataOverview } from "../../api/api";

const HeaderCell = withStyles({
    root: {
        textTransform: "uppercase",
        fontWeight: "bold"
    }
})(TableCell);

const DataOverviewTable: React.FC = withIdToken(({ token }) => {
    const { data: overview } = useSWR<IDataOverview>(["/info/data_overview"]);
    const { data: summary } = useSWR<ITrialOverview[]>([
        "/trial_metadata/summaries",
        token
    ]);

    if (summary === undefined || overview === undefined) {
        return (
            <Grid container justify="center">
                <Grid item>
                    <Loader />
                </Grid>
            </Grid>
        );
    }

    if (summary.length === 0) {
        return <Typography>No data found.</Typography>;
    }

    const assays = Object.keys(summary[0]).filter(
        k => !["trial_id", "file_size_bytes"].includes(k)
    );

    // List the trials with the most data first
    const sortedData = sortBy(summary, "file_size_bytes").reverse();

    return (
        <Card>
            <CardContent>
                <Chip
                    variant="outlined"
                    label={
                        <>
                            <Typography
                                display="inline"
                                style={{ fontWeight: "bold" }}
                            >
                                Total Data Ingested:{" "}
                            </Typography>
                            <Typography display="inline">
                                {formatFileSize(overview.num_bytes)}
                            </Typography>
                        </>
                    }
                />
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
                            <HeaderCell>Data Size</HeaderCell>
                            {assays.map(assay => (
                                <HeaderCell key={assay}>{assay}</HeaderCell>
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
