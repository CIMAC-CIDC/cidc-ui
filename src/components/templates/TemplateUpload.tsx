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
    MenuItem,
    Select,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar
} from "@material-ui/core";
import { ITemplateCardProps } from "./TemplatesPage";
import { allNames, onValueChange } from "./utils";
import { getManifestValidationErrors } from "../../api/api";
import { AuthContext } from "../../auth/Auth";
import { WarningRounded, Check } from "@material-ui/icons";

const TemplateUpload: React.FunctionComponent<ITemplateCardProps> = (
    props: ITemplateCardProps
) => {
    const auth = React.useContext(AuthContext)!;

    const fileInput = React.useRef<HTMLInputElement>(null);
    const [manifestType, setManifestType] = React.useState<string | undefined>(
        undefined
    );
    const [errors, setErrors] = React.useState<string[] | undefined>(undefined);
    const getValidations = (file: File) => {
        if (manifestType) {
            getManifestValidationErrors(auth.getIdToken()!, {
                schema: manifestType,
                template: file
            }).then(setErrors);
        }
    };

    // The file is valid if it has been validated and there are no errors
    const fileValid = errors instanceof Array && errors.length === 0;

    return (
        <Card className={props.cardClass}>
            <CardContent>
                <Typography>Upload a shipping / receiving manifest</Typography>
                <form onSubmit={e => e.preventDefault()}>
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
                                        name: "type"
                                    }}
                                    value={manifestType || ""}
                                    onChange={onValueChange(setManifestType)}
                                >
                                    {allNames.manifests.map(name => (
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
                                    disabled={
                                        !manifestType || manifestType === ""
                                    }
                                    onChange={() => {
                                        if (fileInput.current) {
                                            const files =
                                                fileInput.current.files;
                                            if (files && files.length > 0) {
                                                getValidations(files[0]);
                                            }
                                        }
                                    }}
                                    inputProps={{
                                        ref: fileInput,
                                        accept:
                                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
                                disabled={!fileValid && !manifestType}
                            >
                                Upload
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Grid container direction="row">
                    <Grid item>
                        {errors === undefined ? (
                            <Typography>
                                Choose a manifest to view validations.
                            </Typography>
                        ) : errors.length === 0 ? (
                            <>
                                <Typography>Your manifest is valid</Typography>
                                <Check />
                            </>
                        ) : (
                            <List dense>
                                {errors.map(error => (
                                    <ListItem key={error}>
                                        <ListItemAvatar>
                                            <WarningRounded color="error" />
                                        </ListItemAvatar>
                                        <ListItemText>{error}</ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TemplateUpload;
