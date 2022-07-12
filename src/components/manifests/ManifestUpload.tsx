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
                        Upload a shipping / receiving manifest
                    </Typography>
                }
            />
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Grid
                        container
                        direction="row"
                        justify="space-evenly"
                        alignItems="center"
                    >
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <FormLabel component="legend">
                                    Manifest Type
                                </FormLabel>
                                <RadioGroup
                                    name="manifestType"
                                    value={manifestType || ""}
                                    onChange={(e: any) =>
                                        onValueChange(setManifestType)(e)
                                    }
                                    row
                                >
                                    {info &&
                                        info.supportedTemplates.manifests.map(
                                            name => (
                                                <FormControlLabel
                                                    key={name}
                                                    label={name.toUpperCase()}
                                                    value={name}
                                                    control={<Radio />}
                                                    disabled={
                                                        status === "loading"
                                                    }
                                                    data-testid={`radio-${name}`}
                                                />
                                            )
                                        )}
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <FormLabel component="legend">
                                    Select a manifest to upload
                                </FormLabel>
                                <Input
                                    id="uploadInput"
                                    onClick={() => {
                                        // Clear the file input onClick to ensure onChange
                                        // fires on every selection, even if the same file
                                        // is selected twice.
                                        if (fileInput.current) {
                                            fileInput.current.value = "";
                                        }
                                        // Also, reset the form state.
                                        setStatus("unset");
                                        setErrors([]);
                                        setFile(undefined);
                                    }}
                                    disabled={
                                        !manifestType ||
                                        manifestType === "" ||
                                        status === "loading"
                                    }
                                    onChange={() => {
                                        if (fileInput.current) {
                                            const files =
                                                fileInput.current.files;
                                            if (files && files.length > 0) {
                                                setFile(files[0]);
                                            }
                                        }
                                    }}
                                    inputProps={{
                                        ref: fileInput,
                                        accept: XLSX_MIMETYPE,
                                        "data-testid": "manifest-file-input"
                                    }}
                                    type="file"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={status !== "validationSuccess"}
                                data-testid="submit-button"
                            >
                                Upload
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Divider />
                <div style={{ margin: "1em" }}>
                    <Grid container direction="row" alignItems="center">
                        {feedbackDisplay[status]}
                    </Grid>
                </div>
            </CardContent>
        </Card>
    );
};

export default withIdToken(ManifestUpload);
