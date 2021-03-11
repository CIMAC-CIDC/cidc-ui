import * as React from "react";
import { Link as RRLink } from "react-router-dom";
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
    TableCell,
    Link as MuiLink
} from "@material-ui/core";
import { withIdToken } from "../../identity/AuthProvider";
import { DataFile } from "../../../model/file";
import { RouteComponentProps, StaticContext } from "react-router";
import {
    ArrowLeft,
    Category,
    CloudDownload,
    CloudUpload,
    Link as LinkIcon,
    Save
} from "@material-ui/icons";
import CopyToClipboardButton from "../../generic/CopyToClipboardButton";
import { ButtonProps } from "@material-ui/core/Button";
import Loader from "../../generic/Loader";
import IHCBarplotCard from "../../visualizations/IHCBarplotCard";
import ClustergrammerCard from "../../visualizations/ClustergrammerCard";
import TextWithIcon from "../../generic/TextWithIcon";
import {
    formatDataCategory,
    formatDate,
    formatFileSize
} from "../../../util/formatters";
import { isEmpty, map, range, sortBy } from "lodash";
import BatchDownloadDialog from "../shared/BatchDownloadDialog";
import { Skeleton } from "@material-ui/lab";
import { useRootStyles } from "../../../rootStyles";
import useSWR from "swr";
import { apiFetch } from "../../../api/api";
import { useUserContext } from "../../identity/UserProvider";

const getDownloadUrl = (token: string, fileId: number) =>
    apiFetch<string>(`/downloadable_files/download_url?id=${fileId}`, token);

const DownloadURLButton: React.FunctionComponent<{
    fileId: number;
    token: string;
}> = ({ fileId, token }) => {
    const [url, setUrl] = React.useState<string | undefined>();

    const buttonProps: ButtonProps = {
        variant: "outlined",
        color: "primary"
    };

    if (!url) {
        return (
            <Button
                fullWidth
                startIcon={<LinkIcon />}
                onClick={() => {
                    getDownloadUrl(token, fileId).then(u => setUrl(u));
                }}
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
                    startIcon={<LinkIcon />}
                    {...buttonProps}
                    style={{ whiteSpace: "nowrap" }}
                />
            </Grid>
        </Grid>
    );
};

const FileHeader: React.FC<{
    file: DataFile;
    token: string;
}> = ({ file, token }) => {
    const user = useUserContext();

    const doDownload = () => {
        if (token) {
            getDownloadUrl(token, file.id).then(url => {
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
                                {formatDataCategory(file.data_category)}
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
                {user.canDownload && (
                    <Grid
                        container
                        direction="column"
                        spacing={1}
                        wrap="nowrap"
                    >
                        <Grid item>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                startIcon={<CloudDownload />}
                                onClick={() => doDownload()}
                            >
                                Direct Download
                            </Button>
                        </Grid>
                        <Grid item>
                            <DownloadURLButton fileId={file.id} token={token} />
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

const FileDescription: React.FC<{ file: DataFile }> = ({ file }) => {
    return file.long_description ? (
        <Card>
            <CardHeader
                title={<Typography variant="h6">About This File</Typography>}
            />
            <CardContent>
                {file.long_description.split("\n").map(line => (
                    <Typography paragraph key={line}>
                        {line}
                    </Typography>
                ))}
            </CardContent>
        </Card>
    ) : null;
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

const RelatedFiles: React.FC<{ file: DataFile; token: string }> = ({
    token,
    file
}) => {
    const user = useUserContext();
    const [batchDownloadOpen, setBatchDownloadOpen] = React.useState<boolean>(
        false
    );
    const { data: relatedFiles } = useSWR<DataFile[]>([
        `/downloadable_files/${file.id}/related_files`,
        token
    ]);

    const header = (
        <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
        >
            <Grid item>
                <Typography variant="h6">
                    Related {file.data_category_prefix} files within{" "}
                    {file.trial_id}
                </Typography>
            </Grid>
            <Grid item>
                {user.canDownload && (
                    <Button
                        variant="outlined"
                        color="primary"
                        disabled={!relatedFiles || relatedFiles.length === 0}
                        startIcon={<CloudDownload />}
                        onClick={() => setBatchDownloadOpen(true)}
                    >
                        download all related files
                    </Button>
                )}
            </Grid>
        </Grid>
    );

    const noRelatedFilesMessage = (
        <Grid item>
            <Typography color="textSecondary">
                This file has no directly related files, but you can still{" "}
                <MuiLink
                    href={`/browse-data?file_view=1&trial_ids=${file.trial_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    browse all files in this trial{" "}
                </MuiLink>
                .
            </Typography>
        </Grid>
    );

    const relatedFilesList = relatedFiles && (
        <>
            {sortBy(relatedFiles, "object_url").map(({ id, object_url }) => {
                return (
                    <Grid item key={object_url} xs={6}>
                        <Typography>
                            <MuiLink
                                href={`/browse-data/${id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {object_url}
                            </MuiLink>
                        </Typography>
                    </Grid>
                );
            })}
        </>
    );

    return (
        <Card>
            <CardHeader title={header} />
            <CardContent>
                <BatchDownloadDialog
                    token={token}
                    ids={[file.id, ...map(relatedFiles, "id")]}
                    open={batchDownloadOpen}
                    onClose={() => setBatchDownloadOpen(false)}
                />
                <Grid container direction="row" spacing={1}>
                    {relatedFiles
                        ? relatedFiles.length > 0
                            ? relatedFilesList
                            : noRelatedFilesMessage
                        : range(5).map(i => (
                              <Grid item xs={6} key={i}>
                                  <Skeleton width="100%" height={25} />
                              </Grid>
                          ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

const FileDetailsPage: React.FC<RouteComponentProps<
    {
        fileId: string;
    },
    StaticContext,
    { prevPath?: string }
> & { token: string }> = ({ token, ...props }) => {
    const rootClasses = useRootStyles();

    const fileId = props.match.params.fileId;
    const { data: file } = useSWR<DataFile>([
        `/downloadable_files/${fileId}`,
        token
    ]);

    return !file || !token ? (
        <Loader />
    ) : (
        <Grid container spacing={2} className={rootClasses.centeredPage}>
            <Grid item xs={12}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ArrowLeft />}
                    component={RRLink}
                    to={
                        props.history.location.state?.prevPath ||
                        "/browse-data?file_view=1"
                    }
                >
                    back to file browser
                </Button>
            </Grid>
            <Grid item xs={12}>
                <FileHeader file={file} token={token} />
            </Grid>
            <Grid item xs={12}>
                <FileDescription file={file} />
            </Grid>
            {file.ihc_combined_plot && (
                <Grid item xs={12}>
                    <IHCBarplotCard data={file.ihc_combined_plot} />
                </Grid>
            )}
            {file.clustergrammer && (
                <Grid item xs={12}>
                    <ClustergrammerCard file={file} />
                </Grid>
            )}
            {!isEmpty(file.additional_metadata) && (
                <Grid item xs={12}>
                    <AdditionalMetadataTable file={file} />
                </Grid>
            )}
            <Grid item xs={12}>
                <RelatedFiles file={file} token={token} />
            </Grid>
        </Grid>
    );
};

export default withIdToken(FileDetailsPage);
