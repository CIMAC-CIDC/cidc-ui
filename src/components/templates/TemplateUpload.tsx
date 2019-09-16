import * as React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    Grid,
    Input,
    InputLabel,
    Select,
    List,
    ListItem,
    ListItemText,
    Divider,
    MenuItem,
    ListItemIcon
} from "@material-ui/core";
import { ITemplateCardProps } from "./TemplatesPage";
import { onValueChange } from "./utils";
import { getManifestValidationErrors, uploadManifest } from "../../api/api";
import { AuthContext } from "../../auth/Auth";
import { WarningRounded, CheckBoxRounded } from "@material-ui/icons";
import { XLSX_MIMETYPE, ALL_TEMPLATE_NAMES } from "../../util/constants";
import Loader from "../generic/Loader";

type Status =
    | "loading"
    | "unset"
    | "validationErrors"
    | "validationSuccess"
    | "uploadErrors"
    | "uploadSuccess";

const TemplateUpload: React.FunctionComponent<ITemplateCardProps> = (
    props: ITemplateCardProps
) => {
    const auth = React.useContext(AuthContext)!;

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

    // When the manifest file or manifest type changes, run validations
    React.useEffect(() => {
        if (file && manifestType) {
            setStatus("loading");
            getManifestValidationErrors(auth.getIdToken()!, {
                schema: manifestType,
                template: file
            }).then(errs => {
                setErrors(errs);
                if (errs) {
                    setStatus(
                        errs.length ? "validationErrors" : "validationSuccess"
                    );
                }
            });
        }
    }, [file, manifestType, auth]);

    // The file is valid if it has been validated and there are no errors
    const fileValid = errors instanceof Array && errors.length === 0;

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (manifestType && file) {
            setStatus("loading");
            uploadManifest(auth.getIdToken()!, {
                schema: manifestType,
                template: file
            })
                .then(({ metadata_json_patch }) => {
                    setStatus("uploadSuccess");
                    setTargetTrial(
                        metadata_json_patch.lead_organization_study_id
                    );
                })
                .catch(err => {
                    setErrors([`Upload failed: ${err.toString()}`]);
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
        <Card className={props.cardClass}>
            <CardContent>
                <Typography variant="title">
                    Upload a shipping / receiving manifest
                </Typography>
                <form onSubmit={onSubmit}>
                    <Grid
                        container
                        direction="row"
                        justify="space-evenly"
                        alignItems="center"
                    >
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="manifestType">
                                    Manifest Type
                                </InputLabel>
                                <Select
                                    inputProps={{
                                        id: "manifestType",
                                        name: "type",
                                        "data-testid": "manifest-type-select"
                                    }}
                                    value={manifestType || ""}
                                    onChange={onValueChange(setManifestType)}
                                >
                                    {ALL_TEMPLATE_NAMES.manifests.map(name => (
                                        <MenuItem key={name} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="uploadInput" shrink>
                                    Select a manifest to upload
                                </InputLabel>
                                <Input
                                    id="uploadInput"
                                    onClick={() => {
                                        // Clear the file input onClick to ensure onChange
                                        // fires on every selection, even if the same file
                                        // is selected twice.
                                        if (fileInput.current) {
                                            fileInput.current.value = "";
                                        }
                                    }}
                                    disabled={
                                        !manifestType || manifestType === ""
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
                                disabled={!fileValid}
                                data-testid="submit-button"
                            >
                                Upload
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Divider />
                <div
                    style={{
                        margin: "1em",
                        maxHeight: "15em",
                        overflowY: "scroll"
                    }}
                >
                    <Grid container direction="row" alignItems="center">
                        {feedbackDisplay[status]}
                    </Grid>
                </div>
            </CardContent>
        </Card>
    );
};

export default TemplateUpload;
