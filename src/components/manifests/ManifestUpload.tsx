import * as React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    Grid,
    Input,
    List,
    ListItem,
    ListItemText,
    Divider,
    ListItemIcon,
    CardHeader,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel
} from "@material-ui/core";
import {
    WarningRounded,
    CheckBoxRounded,
    CloudUpload
} from "@material-ui/icons";
import { XLSX_MIMETYPE } from "../../util/constants";
import Loader from "../generic/Loader";
import { withIdToken } from "../identity/AuthProvider";
import { InfoContext } from "../info/InfoProvider";
import { apiCreate } from "../../api/api";

type Status =
    | "loading"
    | "unset"
    | "validationErrors"
    | "validationSuccess"
    | "uploadErrors"
    | "uploadSuccess";

const ManifestUpload: React.FunctionComponent<{ token: string }> = ({
    token
}) => {
    const info = React.useContext(InfoContext);

    const fileInput = React.useRef<HTMLInputElement>(null);

    const [manifestType, setManifestType] = React.useState<string | undefined>(
        undefined
    );
    const [status, setStatus] = React.useState<Status>("unset");
    const [errors, setErrors] = React.useState<string[] | undefined>(undefined);
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [targetTrial, setTargetTrial] = React.useState<string | undefined>(
        undefined
    );

    const formData = React.useMemo(() => {
        if (manifestType && file) {
            const data = new FormData();
            data.append("schema", manifestType.toLowerCase());
            data.append("template", file);
            return data;
        }
    }, [manifestType, file]);

    // When the manifest file or manifest type changes, run validations
    React.useEffect(() => {
        if (formData && token) {
            setStatus("loading");
            apiCreate<{ errors: string[] }>("/ingestion/validate", token, {
                data: formData
            })
                .then(() => setStatus("validationSuccess"))
                .catch(({ response }) => {
                    const errs = response.data._error.message.errors;
                    setErrors(errs);
                    setStatus("validationErrors");
                });
        }
    }, [formData, token]);

    const onValueChange = (setState: (v: string | undefined) => void) => {
        return (e: React.ChangeEvent<HTMLSelectElement>) =>
            setState(e.target.value);
    };

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setStatus("loading");
        if (formData) {
            apiCreate<{
                metadata_json_patch: { protocol_identifier: string };
            }>("ingestion/upload_manifest", token, { data: formData })
                .then(({ metadata_json_patch }) => {
                    setStatus("uploadSuccess");
                    setTargetTrial(metadata_json_patch.protocol_identifier);
                })
                .catch(err => {
                    if (err.response.status < 500) {
                        const errs = err.response.data._error.message.errors;
                        setErrors(["Upload failed:", ...errs]);
                    } else {
                        setErrors([`Upload failed: ${err.toString()}`]);
                    }
                    setStatus("uploadErrors");
                });
        }
    };

    const errorList =
        errors &&
        errors.map(error => (
            <ListItem key={error}>
                <ListItemIcon>
                    <WarningRounded color="error" />
                </ListItemIcon>
                <ListItemText>{error}</ListItemText>
            </ListItem>
        ));

    const successMessage = (message: string) => (
        <ListItem>
            <ListItemIcon>
                <CheckBoxRounded color="primary" />
            </ListItemIcon>
            <ListItemText>{message}</ListItemText>
        </ListItem>
    );

    const feedbackDisplay: { [k in Status]: React.ReactElement } = {
        unset: (
            <Typography color="textSecondary" data-testid="unset">
                Select a manifest to view validations.
            </Typography>
        ),
        loading: <Loader size={32} />,
        validationErrors: (
            <List data-testid="validationErrors">{errorList}</List>
        ),
        validationSuccess: (
            <List dense data-testid="validationSuccess">
                {successMessage("Manifest is valid.")}
            </List>
        ),
        uploadErrors: <List data-testid="uploadErrors">{errorList}</List>,
        uploadSuccess: (
            <List dense data-testid="uploadSuccess">
                {successMessage(
                    `Successfully uploaded ${manifestType} manifest to ${targetTrial}.`
                )}
            </List>
        )
    };

    return (
        <Card>
            <CardHeader
                avatar={<CloudUpload />}
                title={
                    <Typography variant="h6">
                        Uploading a shipping / receiving manifest has been
                        temporarily disabled
                    </Typography>
                }
            />
        </Card>
    );
};

export default withIdToken(ManifestUpload);
