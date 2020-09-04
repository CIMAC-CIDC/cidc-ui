import * as React from "react";
import { getSingleFile, getDownloadURL } from "../../api/api";
import { Grid, Button, Card, CardContent, CardHeader } from "@material-ui/core";
import { AdditionalMetadataTable, CoreDetailsTable } from "./FileDetails";
import { AuthContext } from "../identity/AuthProvider";
import { DataFile } from "../../model/file";
import { RouteComponentProps, Route } from "react-router";
import { CloudDownload, Link, Refresh } from "@material-ui/icons";
import CopyToClipboardButton from "../generic/CopyToClipboardButton";
import { ButtonProps } from "@material-ui/core/Button";
import Loader from "../generic/Loader";
import ClustergrammerPage from "./ClustergrammerPage";
import IHCBarplot from "../visualizations/IHCBarplot";

const DownloadURL: React.FunctionComponent<{
    fileId: string;
    idToken: string;
}> = props => {
    const [url, setURL] = React.useState<string | undefined>(undefined);
    const [loading, setLoading] = React.useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "primary"
    };

    if (!url) {
        return (
            <Button
                fullWidth
                startIcon={<Refresh />}
                onClick={() => {
                    setLoading(true);
                    getDownloadURL(props.idToken, props.fileId).then(urlRes => {
                        setURL(urlRes);
                        setLoading(false);
                    });
                }}
                disabled={loading}
                {...buttonProps}
            >
                Generate temporary download link
            </Button>
        );
    }

    return (
        <Grid container spacing={1} wrap="nowrap" alignItems="center">
            <Grid
                item
                style={{
                    border: "solid 1px #cfd0d0",
                    padding: 4,
                    borderRadius: 5,
                    width: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}
            >
                {url}
            </Grid>
            <Grid item>
                <CopyToClipboardButton
                    title="Link"
                    copyValue={url}
                    startIcon={<Link />}
                    {...buttonProps}
                    style={{ whiteSpace: "nowrap" }}
                />
            </Grid>
        </Grid>
    );
};

const FileDetailsPage: React.FunctionComponent<RouteComponentProps<{
    fileId: string;
}>> = props => {
    const authData = React.useContext(AuthContext);
    const [file, setFile] = React.useState<DataFile | undefined>(undefined);

    const idToken = authData && authData.idToken;
    const fileId = props.match.params.fileId;

    React.useEffect(() => {
        if (idToken) {
            getSingleFile(idToken, fileId).then(fileRes => setFile(fileRes));
        }
    }, [idToken, fileId]);

    const doDownload = () => {
        if (idToken && file) {
            getDownloadURL(idToken, fileId).then(url => {
                window.location.href = url;
            });
        }
    };

    const showVis = fileId && !props.location.pathname.endsWith(fileId);
    const clustergrammerPath = props.location.pathname + "/clustergrammer";

    return (
        <div>
            {!file || !idToken ? (
                <Loader />
            ) : showVis ? (
                <Route
                    path="/browse-files/:fileId/clustergrammer"
                    render={routeProps => (
                        <ClustergrammerPage file={file} {...routeProps} />
                    )}
                ></Route>
            ) : (
                <Grid
                    container
                    spacing={3}
                    direction="column"
                    style={{ width: 1050, margin: "auto" }}
                >
                    <Grid item>
                        <Grid
                            container
                            spacing={3}
                            direction="row"
                            wrap="nowrap"
                        >
                            <Grid item>
                                <CoreDetailsTable file={file} />
                            </Grid>
                            <Grid item>
                                <Card>
                                    <CardHeader title="Available Actions"></CardHeader>
                                    <CardContent>
                                        <Grid
                                            container
                                            spacing={1}
                                            direction="column"
                                            wrap="nowrap"
                                            style={{ width: 350 }}
                                        >
                                            <Grid item>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={
                                                        <CloudDownload />
                                                    }
                                                    onClick={() => doDownload()}
                                                    disabled={!idToken}
                                                >
                                                    Direct Download
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <DownloadURL
                                                    idToken={idToken}
                                                    fileId={fileId}
                                                />
                                            </Grid>
                                            {file.clustergrammer && (
                                                <Grid item>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() =>
                                                            props.history.push(
                                                                clustergrammerPath
                                                            )
                                                        }
                                                        disabled={!idToken}
                                                    >
                                                        Visualize with
                                                        Clustergrammer
                                                    </Button>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                    {file.additional_metadata && (
                        <Grid item>
                            <AdditionalMetadataTable file={file} />
                        </Grid>
                    )}
                    {file.ihc_combined_plot && (
                        <Grid item>
                            <IHCBarplot data={file.ihc_combined_plot} />
                        </Grid>
                    )}
                </Grid>
            )}
        </div>
    );
};

export default FileDetailsPage;
