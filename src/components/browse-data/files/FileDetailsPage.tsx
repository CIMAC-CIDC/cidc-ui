import * as React from "react";
import { getSingleFile, getDownloadURL } from "../../../api/api";
import {
    Grid,
    Button,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell
} from "@material-ui/core";
import { AuthContext } from "../../identity/AuthProvider";
import { DataFile } from "../../../model/file";
import { RouteComponentProps } from "react-router";
import {
    Category,
    CloudDownload,
    CloudUpload,
    Link,
    Save
} from "@material-ui/icons";
import CopyToClipboardButton from "../../generic/CopyToClipboardButton";
import { ButtonProps } from "@material-ui/core/Button";
import Loader from "../../generic/Loader";
import IHCBarplot from "../../visualizations/IHCBarplot";
import ClustergrammerCard from "../../visualizations/ClustergrammerCard";
import TextWithIcon from "../../generic/TextWithIcon";
import { formatDate, formatFileSize } from "../../../util/formatters";
import { map } from "lodash";

const DownloadURL: React.FunctionComponent<{
    fileId: number;
    idToken: string;
}> = props => {
    const [url, setURL] = React.useState<string | undefined>(undefined);
    const [loading, setLoading] = React.useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: "outlined",
        color: "primary"
    };

    if (!url) {
        return (
            <Button
                fullWidth
                startIcon={<Link />}
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
                temporary download link
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
                    width: 200,
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

const FileHeader: React.FC<{ file: DataFile; token: string }> = ({
    file,
    token
}) => {
    const doDownload = () => {
        if (token && file) {
            getDownloadURL(token, file.id).then(url => {
                window.location.assign(url);
            });
        }
    };

    return (
        <Grid container wrap="nowrap" justify="space-between">
            <Grid item xs={9}>
                <Typography variant="h5" paragraph>
                    {file.object_url}
                </Typography>
                <Grid container spacing={2}>
                    {file.data_category && (
                        <Grid item>
                            <TextWithIcon
                                icon={<Category />}
                                variant="subtitle1"
                            >
                                {file.data_category}
                            </TextWithIcon>
                        </Grid>
                    )}
                    <Grid item>
                        <TextWithIcon icon={<Save />} variant="subtitle1">
                            {formatFileSize(file.file_size_bytes)}
                        </TextWithIcon>
                    </Grid>
                    <Grid item>
                        <TextWithIcon
                            icon={<CloudUpload />}
                            variant="subtitle1"
                        >
                            {formatDate(file.uploaded_timestamp)}
                        </TextWithIcon>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3}>
                <Grid container direction="column" spacing={1} wrap="nowrap">
                    <Grid item>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<CloudDownload />}
                            onClick={() => doDownload()}
                            disabled={!token}
                        >
                            Direct Download
                        </Button>
                    </Grid>
                    <Grid item>
                        <DownloadURL idToken={token} fileId={file.id} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const FileDescription: React.FC<{ file: DataFile }> = ({ file }) => {
    return (
        <Card>
            <CardHeader
                title={<Typography variant="h6">About This File</Typography>}
            />
            <CardContent>
                {file.long_description ? (
                    <Typography>{file.long_description}</Typography>
                ) : (
                    <Typography color="textSecondary">
                        There's no description available for this file type -
                        yet! We're working on it, and we should have one soon.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export const AdditionalMetadataTable: React.FunctionComponent<{
    file: DataFile;
}> = ({ file }) => {
    const metadata = file.additional_metadata;

    // Presentational formatting
    const processKey = (key: string) => key.replace("assays.", "");
    const processValue = (value: any) => {
        if (value instanceof Array) {
            return value.join(", ");
        }
        return value.toString();
    };

    // For checking how nested in the data model a metadata key is
    const countDots = (s: string) => (s.match(/\./g) || []).length;

    // Format the metadata
    const rows = map(metadata, (value, key) => ({
        name: processKey(key),
        value: processValue(value)
    })).sort((a, b) => countDots(a.name) - countDots(b.name));

    return (
        <Card>
            <CardHeader
                title={
                    <Typography variant="h6">Additional Metadata</Typography>
                }
            />
            <CardContent style={{ padding: 0 }}>
                <Table size="small">
                    <TableBody>
                        {rows.map(({ name, value }) => (
                            <TableRow key={name}>
                                <TableCell>
                                    <strong>{name}</strong>
                                </TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const FileDetailsPage: React.FC<RouteComponentProps<{
    fileId: string;
}>> = props => {
    const authData = React.useContext(AuthContext);
    const [file, setFile] = React.useState<DataFile | undefined>(undefined);

    const idToken = authData && authData.idToken;
    const fileId = props.match.params.fileId;
    const fileIdInt = parseInt(fileId, 10);

    React.useEffect(() => {
        if (idToken) {
            getSingleFile(idToken, fileIdInt).then(fileRes => setFile(fileRes));
        }
    }, [idToken, fileIdInt]);

    return (
        <div>
            {!file || !idToken ? (
                <Loader />
            ) : (
                <Grid
                    container
                    spacing={2}
                    style={{ width: 1050, margin: "auto" }}
                >
                    <Grid item xs={12}>
                        <FileHeader file={file} token={idToken} />
                    </Grid>
                    <Grid item xs={12}>
                        <FileDescription file={file} />
                    </Grid>
                    {file.ihc_combined_plot && (
                        <Grid item xs={12}>
                            <IHCBarplot data={file.ihc_combined_plot} />
                        </Grid>
                    )}
                    {file.clustergrammer && (
                        <Grid item xs={12}>
                            <ClustergrammerCard file={file} />
                        </Grid>
                    )}
                    {file.additional_metadata && (
                        <Grid item xs={12}>
                            <AdditionalMetadataTable file={file} />
                        </Grid>
                    )}
                </Grid>
            )}
        </div>
    );
};

export default FileDetailsPage;
