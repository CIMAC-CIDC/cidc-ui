import React from "react";
import {
    Grid,
    Card,
    Typography,
    CardContent,
    Button,
    ButtonProps,
    Box,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    Divider,
    withStyles,
    Link
} from "@material-ui/core";
import { apiFetch, IApiPage } from "../../../api/api";
import { IFileBundle, Trial } from "../../../model/trial";
import { withIdToken } from "../../identity/AuthProvider";
import { flatMap, isEmpty, omitBy, pickBy, range } from "lodash";
import { CloudDownload } from "@material-ui/icons";
import BatchDownloadDialog from "../shared/BatchDownloadDialog";
import { Skeleton } from "@material-ui/lab";
import { useFilterFacets } from "../shared/FilterProvider";
import { useSWRInfinite } from "swr";
import { formatQueryString } from "../../../util/formatters";
import { useUserContext } from "../../identity/UserProvider";

const BatchDownloadButton: React.FC<{
    ids: number[];
    token: string;
} & ButtonProps> = ({ ids, token, children, disabled }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
        <>
            <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<CloudDownload />}
                disabled={!ids.length || disabled}
                onClick={() => {
                    setOpen(true);
                }}
                children={children}
            />
            <BatchDownloadDialog
                token={token}
                ids={ids}
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

const TrialPlaceholder: React.FC = () => {
    return (
        <Card data-testid="placeholder-card">
            <CardContent>
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="stretch"
                        >
                            <Grid item xs={4}>
                                <Skeleton />
                                <Skeleton />
                            </Grid>
                            <Grid item xs={2}>
                                <Skeleton height={40} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </Grid>
                </Grid>
                <Skeleton />
            </CardContent>
        </Card>
    );
};

interface ITrialCardProps {
    trial: Trial;
    token: string;
}

const isClinical = (_: any, key: string) =>
    ["Participants Info", "Samples Info"].includes(key);

const AssayButton: React.FC<{
    purpose: keyof IFileBundle[keyof IFileBundle];
    bundle: IFileBundle[keyof IFileBundle];
    token: string;
}> = ({ purpose, bundle, token }) => {
    const user = useUserContext();
    const ids = bundle[purpose] || [];
    return (
        <Box m={1}>
            <BatchDownloadButton
                token={token}
                ids={ids}
                disabled={!user.canDownload}
            >
                {ids.length} files
            </BatchDownloadButton>
        </Box>
    );
};

const AssayTableCell = withStyles({
    root: {
        borderBottom: "none"
    }
})(TableCell);

const AssayButtonTable: React.FC<{
    token: string;
    assayBundle: IFileBundle;
}> = ({ token, assayBundle }) => {
    return (
        <Table size="small" padding="none">
            <TableHead>
                <TableRow>
                    <AssayTableCell align="left">
                        <Typography variant="overline" color="textSecondary">
                            Assay
                        </Typography>
                    </AssayTableCell>
                    <AssayTableCell align="center">
                        <Typography variant="overline" color="textSecondary">
                            Source Files
                        </Typography>
                    </AssayTableCell>
                    <AssayTableCell align="center">
                        <Typography variant="overline" color="textSecondary">
                            Analysis Files
                        </Typography>
                    </AssayTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Object.entries(assayBundle).map(([assay, bundle]) => {
                    if (assay === "other") {
                        return null;
                    }

                    return (
                        <TableRow key={assay}>
                            <AssayTableCell>{assay}</AssayTableCell>
                            <AssayTableCell>
                                <AssayButton
                                    token={token}
                                    purpose={"source"}
                                    bundle={bundle}
                                />
                            </AssayTableCell>
                            <AssayTableCell>
                                <AssayButton
                                    token={token}
                                    purpose={"analysis"}
                                    bundle={bundle}
                                />
                            </AssayTableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

const LabelAndValue: React.FC<{
    label: string;
    value: string | React.ReactElement;
}> = ({ label, value }) => {
    return (
        <Grid container alignItems="center">
            <Grid item>
                <Box paddingRight={1}>
                    <Typography noWrap variant="overline" color="textSecondary">
                        {label}
                    </Typography>
                </Box>
            </Grid>
            <Grid item>
                <Typography variant="subtitle2">{value}</Typography>
            </Grid>
        </Grid>
    );
};

export const TrialCard: React.FC<ITrialCardProps> = ({ trial, token }) => {
    const user = useUserContext();
    const {
        trial_name,
        nct_id,
        trial_status,
        biobank,
        lead_cimac_pis
    } = trial.metadata_json;

    const fileBundle = trial.file_bundle || {};
    const clinicalBundle = pickBy(fileBundle, isClinical);
    const clinicalIds = flatMap(clinicalBundle, bundle =>
        flatMap(bundle, v => v || [])
    );
    const assayBundle = omitBy(
        fileBundle,
        (v, k) => isClinical(v, k) || k === "other"
    );

    const rightPanel =
        isEmpty(assayBundle) && isEmpty(clinicalBundle) ? (
            <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: "100%" }}
            >
                <Grid item>
                    <Typography color="textSecondary" variant="subtitle2">
                        No files have been uploaded yet.
                    </Typography>
                </Grid>
            </Grid>
        ) : (
            <>
                <Typography variant="overline" color="textSecondary">
                    Clinical/Sample Data
                </Typography>
                <BatchDownloadButton
                    token={token}
                    ids={clinicalIds}
                    disabled={!user.canDownload}
                >
                    {clinicalIds.length} participant/sample files
                </BatchDownloadButton>
                {!isEmpty(assayBundle) && (
                    <Box paddingTop={1}>
                        <AssayButtonTable
                            token={token}
                            assayBundle={assayBundle}
                        />
                    </Box>
                )}
            </>
        );

    const leftPanel = (
        <>
            <Typography variant="h6">
                <strong>{trial.trial_id}</strong>{" "}
            </Typography>
            <Grid container spacing={1}>
                {[
                    [
                        "nct number",
                        <Link
                            href={`https://clinicaltrials.gov/ct2/show/${nct_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {nct_id}
                        </Link>
                    ],
                    [
                        "cimac investigator(s)",
                        lead_cimac_pis ? lead_cimac_pis.join(", ") : undefined,
                        12
                    ],
                    ["biobank", biobank, 12],
                    ["status", trial_status],
                    [
                        "participants",
                        trial.num_participants === undefined
                            ? "-"
                            : trial.num_participants
                    ],
                    [
                        "samples",
                        trial.num_samples === undefined
                            ? "-"
                            : trial.num_samples
                    ],
                    [
                        "assays",
                        assayBundle ? Object.keys(assayBundle).length : 0
                    ],
                    ["overview", trial_name, 12]
                ]
                    .filter(config => config[1] !== undefined)
                    .map(([label, value, width]) => (
                        <Grid item key={label} xs={width}>
                            <LabelAndValue label={label} value={value} />
                        </Grid>
                    ))}
            </Grid>
        </>
    );

    return (
        <Card>
            <CardContent>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    wrap="nowrap"
                >
                    <Grid item xs={6}>
                        {leftPanel}
                    </Grid>
                    <Grid item>
                        <Divider orientation="vertical" />
                    </Grid>
                    <Grid item xs={5}>
                        {rightPanel}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const TRIALS_PER_PAGE = 10;
export const usePaginatedTrials = (token: string) => {
    const { filters } = useFilterFacets();
    const getTrialURL = (
        pageIndex: number,
        previousPageData: IApiPage<Trial> | null
    ) => {
        if (previousPageData && !previousPageData._items.length) {
            return null;
        }
        return [
            `/trial_metadata?${formatQueryString({
                include_file_bundles: true,
                include_counts: true,
                page_size: TRIALS_PER_PAGE,
                page_num: pageIndex,
                trial_ids: filters.trial_ids
                    ? encodeURIComponent(filters.trial_ids.join(","))
                    : undefined
            })}`,
            token
        ];
    };

    const { data, isValidating, setSize } = useSWRInfinite<IApiPage<Trial>>(
        getTrialURL,
        apiFetch // provide this explicitly because that makes mocking in tests easier
    );
    const trials = data?.flatMap(page => page._items);
    const allLoaded =
        trials &&
        (trials.length === 0 || trials.length % TRIALS_PER_PAGE !== 0);

    const loadMore = React.useCallback(() => {
        setSize(size => size + 1);
    }, [setSize]);

    // Clear all results when filters change if data has already loaded
    const hasTrials = !!trials;
    React.useEffect(() => {
        if (hasTrials) {
            setSize(1);
        }
    }, [filters.trial_ids, setSize, hasTrials]);

    return {
        trials,
        allLoaded,
        isLoading: isValidating,
        loadMore
    };
};

export interface ITrialTableProps {
    viewToggleButton: React.ReactElement;
}

const TrialTable: React.FC<ITrialTableProps & {
    token: string;
}> = ({ token, viewToggleButton }) => {
    const { trials, loadMore, isLoading, allLoaded } = usePaginatedTrials(
        token
    );

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    spacing={1}
                >
                    <Grid item>
                        <Box margin={1}>
                            <Typography color="textSecondary" variant="caption">
                                Browse trial overviews and download batches of
                                data
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item>{viewToggleButton}</Grid>
                </Grid>
            </Grid>
            {trials ? (
                trials.map(t => {
                    return (
                        <Grid item key={t.trial_id}>
                            <TrialCard trial={t} token={token} />
                        </Grid>
                    );
                })
            ) : (
                <>
                    {range(5).map(i => (
                        <Grid key={i} item>
                            <TrialPlaceholder />
                        </Grid>
                    ))}
                </>
            )}
            {trials &&
                (allLoaded ? (
                    <Grid item>
                        <Box textAlign="center">
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                            >
                                Loaded all results.
                            </Typography>
                        </Box>
                    </Grid>
                ) : (
                    <Grid item>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            disabled={isLoading}
                            onClick={() => loadMore()}
                        >
                            load more trials
                        </Button>
                    </Grid>
                ))}
        </Grid>
    );
};

export default withIdToken<ITrialTableProps>(TrialTable);
