import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid
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

const BatchDownloadDialog: React.FC<IBatchDownloadDialogProps> = ({
    ids,
    token,
    open,
    onClose
}) => {
    const [error, setError] = React.useState<string>("");

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
                if (err.response.status) {
                    setError(
                        "You don't have permission to download the files in this batch. Please contact cidc@jimmy.harvard.edu if you believe this is a mistake."
                    );
                }
            });
    };

    return (
        <Dialog open={!!open} onClose={onClose}>
            <DialogTitle>
                Batch download{" "}
                <strong>
                    {ids.length} file{ids.length !== 1 ? "s" : ""}
                </strong>
            </DialogTitle>
            <DialogContent>
                <CIDCMarkdown
                    source={[
                        'Download the "filelist.tsv" file for this file batch,' +
                            "and run this command in the desired download directory:",
                        "```bash",
                        "cat filelist.tsv | xargs -n 2 -P 8 gsutil cp",
                        "```",
                        "If you haven't logged in with `gcloud` recently, you'll " +
                            "need to run `gcloud auth login` first.",
                        "",
                        "This command requires a [`gsutil`](https://cloud.google.com/storage/docs/gsutil_install) " +
                            "installation and a shell that supports `cat` and `xargs`.",
                        "",
                        "Note: Batch downloads are resumable. If you cancel an ongoing download (e.g., " +
                            "using control+c), you can resume that download by rerunning the download command."
                    ].join("\n")}
                />
                {error && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Grid container justify="space-between">
                    <Grid item>
                        <Button onClick={onClose}>Cancel</Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => downloadFilelist()}
                        >
                            Download Filelist.tsv
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

export default BatchDownloadDialog;
