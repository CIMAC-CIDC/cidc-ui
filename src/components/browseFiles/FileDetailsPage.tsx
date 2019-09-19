import * as React from "react";
import { getSingleFile } from "../../api/api";
import { DataFile } from "../../model/file";
import { Typography, CircularProgress, Grid, Button } from "@material-ui/core";
import FileDetailsTable from "./FileDetailsTable";
import { AuthContext } from "../../auth/AuthProvider";
import { RouteComponentProps } from "react-router";

type UIState = "loading" | "loaded" | "not found";

export default function FileDetailsPage(
    props: RouteComponentProps<{ fileId: string }>
) {
    const authData = React.useContext(AuthContext);

    const [file, setFile] = React.useState<DataFile | undefined>(undefined);
    const [state, setState] = React.useState<UIState>("loading");

    React.useEffect(() => {
        if (authData) {
            getSingleFile(authData.idToken, props.match.params.fileId)
                .then(fileRes => {
                    if (!fileRes) {
                        setState("not found");
                    } else {
                        setState("loaded");
                        setFile(fileRes);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setState("not found");
                });
        }
    }, [authData, props.match.params.fileId]);

    return (
        <div className="Browse-files-page">
            {state === "loading" ? (
                <div className="Browse-files-progress">
                    <CircularProgress />
                </div>
            ) : state === "loaded" && file ? (
                <Grid container={true} spacing={40}>
                    <Grid item={true} xs={6}>
                        <Grid
                            container={true}
                            alignItems="flex-start"
                            justify="space-between"
                            direction="row"
                            spacing={32}
                        >
                            <Grid item={true} xs={7}>
                                <Typography variant="h5" gutterBottom={true}>
                                    Core File Properties:
                                </Typography>
                            </Grid>
                            <Grid item={true}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={file.download_link}
                                    style={{ height: 30 }}
                                >
                                    Download
                                </Button>
                            </Grid>
                        </Grid>
                        <FileDetailsTable file={file} />
                    </Grid>
                </Grid>
            ) : (
                <div className="Browse-files-progress">
                    <Typography style={{ fontSize: 18 }}>
                        No file found.
                    </Typography>
                </div>
            )}
        </div>
    );
}
