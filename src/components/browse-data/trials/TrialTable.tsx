import React from "react";
import {
    Grid,
    Card,
    Typography,
    CardContent,
    Button,
    ButtonProps,
    Box
} from "@material-ui/core";
import { getTrials } from "../../../api/api";
import { getTrialInfo, IFileBundle, Trial } from "../../../model/trial";
import { withIdToken } from "../../identity/AuthProvider";
import { flatMap, flatten, isEmpty, map, omitBy, pickBy, range } from "lodash";
import { CloudDownload } from "@material-ui/icons";
import BatchDownloadDialog from "../shared/BatchDownloadDialog";
import { Skeleton } from "@material-ui/lab";
import { useFilterFacets } from "../shared/FilterProvider";

const BatchDownloadButton: React.FC<{
    ids: number[];
    token: string;
} & ButtonProps> = ({ ids, token, children }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
        <>
            <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<CloudDownload />}
                onClick={e => {
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
    assay: string;
    purpose: keyof IFileBundle[keyof IFileBundle];
    bundle: IFileBundle[keyof IFileBundle];
    token: string;
}> = ({ assay, purpose, bundle, token }) => {
    const ids = bundle[purpose];
    return ids ? (
        <BatchDownloadButton token={token} ids={ids}>
            {ids.length} {assay} {purpose} files
        </BatchDownloadButton>
    ) : (
        <Box textAlign="center">
            <Typography color="textSecondary">(no {purpose} files)</Typography>
        </Box>
    );
};

const AssayButtonTable: React.FC<{
    token: string;
    assayBundle: IFileBundle;
}> = ({ token, assayBundle }) => {
    return (
        <Grid container direction="column">
            {Object.entries(assayBundle).map(([assay, bundle]) => {
                if (assay === "other") {
                    return null;
                }

                return (
                    <Grid item key={assay} style={{ height: "2.5rem" }}>
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                        >
                            <Grid item xs={1}>
                                <Typography variant="subtitle1">
                                    <strong>{assay}</strong>
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <AssayButton
                                    token={token}
                                    bundle={bundle}
                                    purpose={"source"}
                                    assay={assay}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <AssayButton
                                    token={token}
                                    bundle={bundle}
                                    purpose={"analysis"}
                                    assay={assay}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                );
            })}
        </Grid>
    );
};

const TrialCard: React.FC<ITrialCardProps> = ({ trial, token }) => {
    const { participants } = getTrialInfo(trial);
    const sampleCount = flatten(map(participants, "samples")).length;

    // `!` is unsafe, but `TrialTable` will only render this component
    // with trials that have defined `file_bundle`s.
    const fileBundle = trial.file_bundle!;

    const clinicalBundle = pickBy(fileBundle, isClinical);
    const assayBundle = omitBy(
        fileBundle,
        (v, k) => isClinical(v, k) || k === "other"
    );

    // Render nothing if this trial has no files
    if (isEmpty(assayBundle) && isEmpty(clinicalBundle)) {
        return null;
    }

    const clinicalIds = flatMap(clinicalBundle, bundle =>
        flatMap(bundle, v => v || [])
    );

    const header = (
        <>
            <Typography variant="h5">
                <strong>{trial.trial_id}</strong>
            </Typography>
            <Typography variant="subtitle2">
                {participants.length} participants, {sampleCount} samples,{" "}
                {Object.keys(assayBundle).length} assays
            </Typography>
        </>
    );

    return (
        <Grid item>
            <Card>
                <CardContent>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="stretch"
                            >
                                <Grid item>{header}</Grid>
                                <Grid item>
                                    <BatchDownloadButton
                                        token={token}
                                        ids={clinicalIds}
                                    >
                                        {clinicalIds.length} clinical summary
                                        files
                                    </BatchDownloadButton>
                                </Grid>
                            </Grid>
                        </Grid>
                        {!isEmpty(assayBundle) && (
                            <Grid item>
                                <AssayButtonTable
                                    token={token}
                                    assayBundle={assayBundle}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    );
};

const TRIALS_PER_PAGE = 10;
const usePaginatedTrials = (token: string) => {
    const { filters } = useFilterFacets();

    const [trials, setTrials] = React.useState<Trial[] | undefined>();
    const [allLoaded, setAllLoaded] = React.useState<boolean>(false);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [page, setPage] = React.useState<number>(0);

    const loadMore = React.useCallback(() => {
        if (!allLoaded) {
            setIsLoading(true);
            getTrials(token, {
                include_file_bundles: true,
                page_size: TRIALS_PER_PAGE,
                page_num: page,
                trial_ids: filters.trial_ids?.join(",")
            }).then(results => {
                setTrials(ts => [...(ts || []), ...results]);
                if (results.length === TRIALS_PER_PAGE) {
                    setPage(p => p + 1);
                } else {
                    setAllLoaded(true);
                }
                setIsLoading(false);
            });
        }
    }, [allLoaded, page, token, filters.trial_ids]);

    // Clear all results when filters change
    React.useEffect(() => {
        setPage(0);
        setAllLoaded(false);
        setTrials(undefined);
    }, [filters.trial_ids]);

    // Load first page of trials on initial render
    React.useEffect(() => {
        if (page === 0) {
            loadMore();
        }
    }, [page, loadMore]);

    return {
        trials,
        allLoaded,
        isLoading,
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
