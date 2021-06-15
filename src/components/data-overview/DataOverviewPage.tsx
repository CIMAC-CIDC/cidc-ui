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
    Chip,
    Tooltip,
    TableContainer,
    Divider
} from "@material-ui/core";
import { withIdToken } from "../identity/AuthProvider";
import { ITrialOverview } from "../../model/trial";
import useSWR from "swr";
import Loader from "../generic/Loader";
import { RouteComponentProps } from "react-router";
import { theme, useRootStyles } from "../../rootStyles";
import { formatFileSize } from "../../util/utils";
import { IDataOverview } from "../../api/api";
import { makeStyles } from "@material-ui/core";

const NONASSAY_FIELDS = [
    "trial_id",
    "expected_assays",
    "file_size_bytes",
    "expected_assays",
    "clinical_participants",
    "total_participants",
    "total_samples",
    "excluded_samples",
    // Exclude this for now, pending backend updates
    "cytof_s1609_gd2car"
];

const ASSAYS_WITH_ANALYSIS = ["wes", "rna", "tcr", "cytof"];

const HeaderCell = withStyles({
    root: {
        textTransform: "uppercase",
        fontWeight: "bold"
    }
})(TableCell);

const GreyRow = withStyles({
    root: {
        background: theme.palette.grey[50]
    }
})(TableRow);

const NAText: React.FC = () => (
    <Typography color="textSecondary" variant="caption">
        -
    </Typography>
);

type IngestionStatus =
    | "success"
    | "approved-failure"
    | "unapproved-failure"
    | "upstream-pending";

const commonDataStyles = { minWidth: 40 };

const useDataStyles = makeStyles({
    success: {
        ...commonDataStyles,
        background: `${theme.palette.success.light} !important`
    },
    "approved-failure": {
        ...commonDataStyles,
        background: `${theme.palette.primary.light} !important`
    },
    "unapproved-failure": {
        ...commonDataStyles,
        background: `${theme.palette.warning.light} !important`
    },
    "upstream-pending": {
        ...commonDataStyles,
        background: `${theme.palette.grey.A100} !important`
    }
});

const ColoredData: React.FC<{
    status: IngestionStatus;
    tooltip?: string | React.ReactElement;
}> = ({ status, tooltip, children }) => {
    const classes = useDataStyles();
    const chip = (
        <Chip className={classes[status]} size="small" label={children} />
    );
    return tooltip ? (
        <Tooltip title={<Typography variant="caption">{tooltip}</Typography>}>
            {chip}
        </Tooltip>
    ) : (
        chip
    );
};

const AssayCell: React.FC<{
    overview: ITrialOverview;
    assay: string;
    stage: "received" | "analyzed";
}> = ({ overview, assay, stage }) => {
    const received = overview[assay] as number;

    let status: IngestionStatus;
    let count: number;
    let tooltip: string | React.ReactElement;
    switch (stage) {
        case "received":
            count = received;
            // NOTE: as computed here, status may indicate success if some but not all samples have been received
            status = count > 0 ? "success" : "unapproved-failure";
            tooltip =
                count > 0
                    ? "All samples have been received."
                    : "Samples are expected, but none have been received.";
            break;
        case "analyzed":
            const analysis =
                assay === "rna" ? "rna_level1_analysis" : `${assay}_analysis`;
            const excluded =
                (overview.excluded_samples &&
                    overview.excluded_samples[analysis]) ||
                [];

            count = overview[analysis] as number;
            status =
                !count && received === 0
                    ? "upstream-pending"
                    : excluded.length === received - count && count > 0
                    ? excluded.length === 0
                        ? "success"
                        : "approved-failure"
                    : "unapproved-failure";
            tooltip = {
                success: "All received samples have been analyzed.",
                "approved-failure":
                    "Some received samples failed during analysis.",
                "unapproved-failure":
                    "Some received samples have not been analyzed. Either their analysis is still in progress, or they failed analysis but their failures were not documented.",
                "upstream-pending":
                    "Analysis expected once samples are received."
            }[status];

            if (excluded.length > 0) {
                tooltip = (
                    <Grid container direction="column" spacing={1}>
                        <Grid item>
                            {tooltip} The following samples have documented
                            failures:
                        </Grid>
                        {excluded.map(sample => (
                            <Grid item key={sample.cimac_id}>
                                <strong>{sample.cimac_id}</strong> -{" "}
                                {sample.reason_excluded}
                            </Grid>
                        ))}
                    </Grid>
                );
            }

            break;
    }

    return (
        <TableCell
            key={assay}
            align="center"
            data-testid={`data-${overview.trial_id}-${assay}-${stage}`}
        >
            <ColoredData status={status} tooltip={tooltip}>
                {count || 0}
            </ColoredData>
        </TableCell>
    );
};

const DataOverviewRow: React.FC<{
    overview: ITrialOverview;
    assays: string[];
}> = ({ overview, assays }) => {
    return (
        <>
            <TableRow>
                <TableCell rowSpan={3}>{overview.trial_id}</TableCell>
                <TableCell rowSpan={3} align="right">
                    {formatFileSize(overview.file_size_bytes)}
                </TableCell>
                <TableCell rowSpan={3} align="right">
                    <Chip
                        style={{ width: "100%" }}
                        color={
                            overview.clinical_participants > 0
                                ? "primary"
                                : "default"
                        }
                        variant="outlined"
                        label={`${overview.clinical_participants} / ${overview.total_participants} participants`}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                    <Typography variant="overline">
                        <strong>received</strong>
                    </Typography>
                </TableCell>
                {assays.map(assay =>
                    overview.expected_assays.includes(assay) ||
                    overview[assay] > 0 ? (
                        <AssayCell
                            key={assay}
                            assay={assay}
                            overview={overview}
                            stage="received"
                        />
                    ) : (
                        <TableCell
                            key={assay}
                            align="center"
                            data-testid={`na-${overview.trial_id}-${assay}-received`}
                        >
                            <NAText />
                        </TableCell>
                    )
                )}
            </TableRow>
            <GreyRow>
                <TableCell>
                    <Typography variant="overline">
                        <strong>analyzed</strong>
                    </Typography>
                </TableCell>
                {assays.map(assay =>
                    ASSAYS_WITH_ANALYSIS.includes(assay) &&
                    overview.expected_assays.includes(assay) ? (
                        <AssayCell
                            key={assay}
                            assay={assay}
                            overview={overview}
                            stage="analyzed"
                        />
                    ) : (
                        <TableCell
                            key={assay}
                            align="center"
                            data-testid={`na-${overview.trial_id}-${assay}-analyzed`}
                        >
                            <NAText />
                        </TableCell>
                    )
                )}
            </GreyRow>
        </>
    );
};

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
        k => !NONASSAY_FIELDS.includes(k) && !k.endsWith("analysis")
    );

    // List trials with clinical data first, ordered by total file size
    const sortedData = sortBy(summary, s => [
        s.clinical_participants > 0,
        s.file_size_bytes
    ]).reverse();

    return (
        <Card>
            <CardContent>
                <Grid container direction="column" spacing={1}>
                    <Grid item>
                        <Grid container spacing={1} direction="row-reverse">
                            <Grid item>
                                <ColoredData status="success">
                                    success
                                </ColoredData>
                            </Grid>
                            <Grid item>
                                <ColoredData status="approved-failure">
                                    success with expected failures
                                </ColoredData>
                            </Grid>
                            <Grid item>
                                <ColoredData status="unapproved-failure">
                                    pending or has unexpected failures
                                </ColoredData>
                            </Grid>
                            <Grid item>
                                <ColoredData status="upstream-pending">
                                    awaiting upstream ingestion
                                </ColoredData>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2" align="right">
                                    "<NAText />" = not expected
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
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
                    </Grid>
                    <Grid item>
                        <Divider />
                        <TableContainer style={{ maxHeight: 600 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            style={{ borderBottom: 0 }}
                                            colSpan={4}
                                        />
                                        <TableCell
                                            colSpan={assays.length}
                                            align="center"
                                        >
                                            # of Samples per Assay
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <HeaderCell>Protocol ID</HeaderCell>
                                        <HeaderCell>Data Size</HeaderCell>
                                        <HeaderCell align="center">
                                            Clinical Data
                                        </HeaderCell>
                                        <HeaderCell />
                                        {assays.map(assay => (
                                            <HeaderCell
                                                key={assay}
                                                align="center"
                                            >
                                                {assay}
                                            </HeaderCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedData.map(row => (
                                        <DataOverviewRow
                                            key={row.trial_id}
                                            overview={row}
                                            assays={assays}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
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
