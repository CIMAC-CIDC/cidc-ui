import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    LinearProgress,
    Typography
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { apiCreate } from "../../../api/api";
import { CIDCMarkdown } from "../../generic/CIDCGithubMarkdown";

export interface IBatchDownloadDialogProps {
    ids: number[];
    token: string;
    open?: boolean;
    onClose?: () => void;
}

const errors = {
    NO_PERMS:
        "You don't have permission to download the files in this batch. Please contact cidc@jimmy.harvard.edu if you believe this is a mistake.",
    TOO_BIG:
        "This file batch is more than 100MB and cannot be downloaded directly.",
    UNKNOWN: "Encountered an unexpected issue with this download."
};

const BatchDownloadDialog: React.FC<IBatchDownloadDialogProps> = ({
    ids,
    token,
    open,
    onClose
}) => {
    const [error, setError] = React.useState<string>("");
    const [loadingDownload, setLoadingDownload] = React.useState<boolean>(
        false
    );

    const downloadDirectly = () => {
        setLoadingDownload(true);
        apiCreate<string>("/downloadable_files/compressed_batch", token, {
            data: { file_ids: ids }
        })
            .then(url => window.location.assign(url))
            .catch(err => {
                const status = err.response?.status;
                if (status === 404) {
                    setError(errors.NO_PERMS);
                } else if (status === 400) {
                    setError(errors.TOO_BIG);
                } else {
                    setError(errors.UNKNOWN);
                }
            })
            .finally(() => setLoadingDownload(false));
    };

    const downloadFilelist = () => {
        apiCreate<string>("/downloadable_files/filelist", token, {
            data: { file_ids: ids }
        })
            .then(tsv => {
                const blob = new Blob([tsv], {
                    type: "text/tab-separated-values"
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "filelist.tsv";
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(err => {
                if (err.response?.status === 404) {
                    setError(errors.NO_PERMS);
                } else {
                    setError(errors.UNKNOWN);
                }
            });
    };

    return (
        <Dialog
            open={!!open}
            onClose={() => {
                setError("");
                if (onClose) {
                    onClose();
                }
            }}
        >
            <DialogTitle>
                Batch download{" "}
                <strong>
                    {ids.length} file{ids.length !== 1 ? "s" : ""}
                </strong>
            </DialogTitle>
            <DialogContent>
                <Grid
                    container
                    direction="column"
                    alignItems="stretch"
                    spacing={1}
                >
                    <Grid item>
                        <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item xs={5}>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="contained"
                                    disabled={
                                        loadingDownload ||
                                        error === errors.TOO_BIG
                                    }
                                    onClick={() => downloadDirectly()}
                                >
                                    download directly
                                </Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography
                                    style={{
                                        width: "100%",
                                        fontSize: "1rem",
                                        textAlign: "center"
                                    }}
                                    display="block"
                                    variant="overline"
                                >
                                    OR
                                </Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="contained"
                                    onClick={() => downloadFilelist()}
                                >
                                    download filelist.tsv
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        {loadingDownload && (
                            <Alert severity="info">
                                Creating a compressed archive of this file batch
                                (this may take a while).{" "}
                                <LinearProgress variant="indeterminate" />
                            </Alert>
                        )}
                        {error && <Alert severity="error">{error}</Alert>}
                        <Box paddingTop={1}>
                            <Divider />
                        </Box>
                    </Grid>
                    <Grid item>
                        <CIDCMarkdown
                            source={[
                                "Batches larger than 100MB must be downloaded via [`gsutil`](https://cloud.google.com/storage/docs/gsutil_install). " +
                                    'Download the "filelist.tsv" file for this file batch, ' +
                                    "and run the following command in the desired download directory.",
                                "On Mac/Linux:",
                                "```bash",
                                "cat filelist.tsv | xargs -n 2 -P 8 gsutil cp",
                                "```",
                                "On Windows:",
                                "```bash",
                                'for /F "tokens=1,2" %a in (filelist.tsv) do gsutil cp %a %b',
                                "```",
                                "If you haven't logged in with `gcloud` recently, you'll " +
                                    "need to run `gcloud auth login` first.",
                                "",
                                "Note: Batch downloads are resumable. If you cancel an ongoing download (e.g., " +
                                    "using control+c), you can resume that download by rerunning the download command."
                            ].join("\n")}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                {/* placeholder that adds some padding */}
            </DialogActions>
        </Dialog>
    );
};

export default BatchDownloadDialog;
