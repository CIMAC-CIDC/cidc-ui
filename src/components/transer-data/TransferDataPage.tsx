import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    Input,
    InputLabel,
    Link,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import { useRootStyles } from "../../rootStyles";
import { withIdToken } from "../identity/AuthProvider";
import { useForm } from "react-hook-form";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { apiCreate, IApiPage } from "../../api/api";
import { useInfoContext } from "../info/InfoProvider";
import useSWR from "swr";
import { Trial } from "../../model/trial";
import { Alert } from "@material-ui/lab";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { CloudDownload, OpenInNew } from "@material-ui/icons";
import { RouteComponentProps } from "react-router-dom";

const TransferDataForm: React.FC = withIdToken(({ token }) => {
    const info = useInfoContext();
    const uploadTypes = [
        ...info.supportedTemplates.assays,
        ...info.supportedTemplates.analyses
    ];
    const { data } = useSWR<IApiPage<Trial>>([
        "/trial_metadata?page_size=200",
        token
    ]);
    const trialIds = data?._items.map(t => t.trial_id);
    const noTrialPermissions = trialIds?.length === 0;

    const { register, handleSubmit } = useForm();
    const [trialId, setTrialId] = React.useState<string | undefined>();
    const [uploadType, setUploadType] = React.useState<string | undefined>();
    const [urlInfo, setUrlInfo] = React.useState<
        { gs_url: string; console_url: string } | undefined
    >();
    const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);

    const isLoadingURL = trialId && uploadType && urlInfo === undefined;

    const [createIntakeError, setCreateIntakeError] = React.useState<boolean>(
        false
    );

    return (
        <Card style={{ maxWidth: 800 }}>
            <CardHeader title="Transfer data" />
            <CardContent className="markdown-body">
                <Typography>
                    Select the trial and assay type you wish to transfer data
                    for to generate a Google Cloud Storage transfer destination.
                </Typography>
                <Typography gutterBottom>
                    If you have already initiated a data transfer and need to
                    upload additional data or submit a new metadata spreadsheet
                    for it, simply re-enter the trial and upload type relevant
                    to that data transfer.
                </Typography>
                {noTrialPermissions && (
                    <Alert severity="error">
                        <Typography>
                            You don't have permission to upload to any CIMAC
                            trials. Please <ContactAnAdmin lower /> to request
                            permissions.
                        </Typography>
                    </Alert>
                )}
                <form
                    onSubmit={handleSubmit(formData => {
                        setUrlInfo(undefined);
                        setTrialId(formData.trialId);
                        setUploadType(formData.uploadType);
                        apiCreate<typeof urlInfo>(
                            "/ingestion/intake_bucket",
                            token,
                            {
                                data: {
                                    trial_id: formData.trialId,
                                    upload_type: formData.uploadType
                                }
                            }
                        )
                            .then(urlInfoRes => setUrlInfo(urlInfoRes))
                            .catch(error => {
                                console.error(error);
                                if (
                                    error?.response?.status === 503 &&
                                    error.response.data === "Data Freeze"
                                ) {
                                    console.log("DATA FREEZE");
                                    setCreateIntakeError(true);
                                }
                            });
                    })}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="protocol-identifier-label">
                                    Protocol Identifier
                                </InputLabel>
                                <Select
                                    labelId="protocol-identifier-label"
                                    id="protocol-identifier-select"
                                    defaultValue=""
                                    inputRef={ref =>
                                        ref &&
                                        register({
                                            name: "trialId",
                                            value: ref.value
                                        })
                                    }
                                    required
                                >
                                    {trialIds ? (
                                        trialIds.map(tid => (
                                            <MenuItem key={tid} value={tid}>
                                                {tid}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>
                                            loading trials...
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="upload-type-label">
                                    Upload Type
                                </InputLabel>
                                <Select
                                    labelId="upload-type-label"
                                    id="upload-type-select"
                                    defaultValue=""
                                    inputRef={ref =>
                                        ref &&
                                        register({
                                            name: "uploadType",
                                            value: ref.value
                                        })
                                    }
                                    required
                                >
                                    {uploadTypes.map(ut => (
                                        <MenuItem key={ut} value={ut}>
                                            {ut}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems="center" spacing={3}>
                                <Grid item>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            !trialIds ||
                                            noTrialPermissions ||
                                            createIntakeError
                                        }
                                    >
                                        Initiate data transfer
                                    </Button>
                                </Grid>
                                {createIntakeError ? (
                                    <Typography
                                        className="mb-0"
                                        style={{ fontStyle: "italic" }}
                                    >
                                        Creating intake buckets has been
                                        temporarily disabled
                                    </Typography>
                                ) : trialIds === undefined || isLoadingURL ? (
                                    <Grid item>
                                        <CircularProgress size={24} />
                                    </Grid>
                                ) : null}
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
                {urlInfo && trialId && uploadType && (
                    <>
                        <Box my={3}>
                            <Divider />
                        </Box>
                        <Typography>
                            Your transfer destination is{" "}
                            <strong>
                                <code>{urlInfo.gs_url}</code>
                            </strong>
                            .
                        </Typography>
                        <Box px={2}>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Typography variant="h3">
                                        Uploading data has been temporarily
                                        disabled, but you can still
                                        view/download your files.
                                    </Typography>
                                    <Button
                                        onClick={() =>
                                            window.open(
                                                urlInfo.console_url,
                                                "_blank",
                                                "noopener,noreferrer"
                                            )
                                        }
                                        variant="contained"
                                        color="primary"
                                        endIcon={<OpenInNew />}
                                    >
                                        visit the data upload console
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Typography variant="h3">
                                        You can still download an empty metadata
                                        template and populate it with your
                                        upload info while waiting...
                                    </Typography>
                                    <Typography>
                                        Please ensure all filepaths that you
                                        provide are relative to the root of your
                                        local data directory.
                                    </Typography>
                                    <TemplateDownloadButton
                                        verboseLabel
                                        templateName={uploadType}
                                        templateType={
                                            info.supportedTemplates.assays.includes(
                                                uploadType
                                            )
                                                ? "assays"
                                                : "analyses"
                                        }
                                        variant="contained"
                                        color="primary"
                                        endIcon={<CloudDownload />}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
});

const TransferDataPage: React.FC<RouteComponentProps> = () => {
    const classes = useRootStyles();
    return (
        <Grid
            container
            className={classes.centeredPage}
            direction="column"
            spacing={3}
            alignItems="center"
        >
            <Grid item>
                <TransferDataForm />
            </Grid>
        </Grid>
    );
};

export default TransferDataPage;
