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

    return (
        <Card style={{ maxWidth: 800 }}>
            <CardHeader title="Transfer data has been temporarily disabled" />
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
