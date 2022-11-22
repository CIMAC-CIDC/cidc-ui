import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    Checkbox,
    makeStyles,
    Grid,
    Button
} from "@material-ui/core";
import { apiCreate, apiDelete, IApiPage } from "../../api/api";
import { Trial } from "../../model/trial";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
import { InfoContext } from "../info/InfoProvider";
import Loader from "../generic/Loader";
import { UserContext } from "../identity/UserProvider";
import useSWR from "swr";
import { Alert } from "@material-ui/lab";
import { groupBy, mapValues } from "lodash";

export interface IUserPermissionsDialogProps {
    open: boolean;
    grantee: Account;
    token: string;
    onCancel: () => void;
}

const UserPermissionsDialogWithInfo: React.FC<IUserPermissionsDialogProps> = props => {
    const info = React.useContext(InfoContext);
    const granter = React.useContext(UserContext);

    if (!info || !granter) {
        return null;
    }

    const { supportedTemplates, extraDataTypes } = info;

    const supportedTypes = [
        ...supportedTemplates.assays,
        ...supportedTemplates.manifests,
        ...supportedTemplates.analyses,
        ...extraDataTypes
    ];
    const index = supportedTypes.indexOf("clinical_data");
    if (index > -1) {
        // only splice array when item is found
        supportedTypes.splice(index, 1); // 2nd parameter means remove one item only
    }

    return (
        <UserPermissionsDialog
            {...props}
            supportedTypes={supportedTypes}
            granter={granter}
        />
    );
};

const useStyles = makeStyles(theme => ({
    trialCell: {
        position: "sticky",
        background: theme.palette.background.default,
        left: -24,
        zIndex: 100
    },
    tablePagination: { position: "sticky", left: 0 }
}));

const usePermissions = (token: string, grantee: Account) => {
    const swrResults = useSWR<IApiPage<Permission>>([
        `/permissions?user_id=${grantee.id}`,
        token
    ]);

    return {
        ...swrResults
    };
};

const MAX_PERMS = 20;

const UserPermissionsDialog: React.FC<IUserPermissionsDialogProps & {
    supportedTypes: string[];
    granter: Account;
}> = props => {
    const classes = useStyles();

    const {
        data: permBundle,
        mutate,
        isValidating: loadingPerms
    } = usePermissions(props.token, props.grantee);

    const { data: trialBundle } = useSWR<IApiPage<Trial>>(
        props.open ? ["/trial_metadata?page_size=200", props.token] : null
    );
    const trials = trialBundle?._items;

    const blankPermissionList: Permission[] = [];
    let perms = permBundle?._items || [];
    const tooManyPerms = (permBundle?._items || []).length >= MAX_PERMS;

    const defaultFormState = {
        isDirty: false,
        isSubmitted: false,
        isSubmitting: false,
        toAdd: blankPermissionList,
        toRemove: blankPermissionList
    };
    const [formValues, setFormValues] = React.useState(defaultFormState);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        const thisPerm: Permission = JSON.parse(e.currentTarget.value);
        let tempToRemove: Permission[] = [];
        let tempToAdd: Permission[] = [];
        if (e.currentTarget.checked) {
            tempToRemove = formValues.toRemove.filter(
                p =>
                    p.trial_id !== thisPerm.trial_id ||
                    p.upload_type !== thisPerm.upload_type
            );

            tempToAdd = formValues.toAdd;
            if (tempToRemove.length === formValues.toRemove.length) {
                tempToAdd = [...tempToAdd, thisPerm];
            }
            // remove any overlapping permissions if we're adding a cross-trial or cross-assay
            // remember that cross-assay single-trial doesn't apply to clinical_data
            if (!thisPerm.trial_id) {
                tempToAdd = tempToAdd.filter(
                    p => p.upload_type !== thisPerm.upload_type
                );
            } else if (!thisPerm.upload_type) {
                tempToAdd = tempToAdd.filter(
                    p =>
                        p.trial_id !== thisPerm.trial_id ||
                        p.upload_type === "clinical_data"
                );
            }

            perms = [...perms, thisPerm];
        } else {
            tempToAdd = formValues.toAdd.filter(
                p =>
                    p.trial_id !== thisPerm.trial_id ||
                    p.upload_type !== thisPerm.upload_type
            );
            tempToRemove = formValues.toRemove;
            if (tempToAdd.length === formValues.toAdd.length) {
                tempToRemove = [...tempToRemove, thisPerm];
            }
            perms = perms.filter(
                p =>
                    p.trial_id !== thisPerm.trial_id ||
                    p.upload_type !== thisPerm.upload_type
            );
        }

        setFormValues({
            isDirty: tempToAdd.length !== 0 || tempToRemove.length !== 0,
            isSubmitted: false,
            isSubmitting: false,
            toAdd: tempToAdd,
            toRemove: tempToRemove
        });
    };

    const handleSubmit = () => {
        setFormValues({
            isDirty: true,
            isSubmitting: true,
            isSubmitted: false,
            toAdd: formValues.toAdd,
            toRemove: formValues.toRemove
        });

        if (formValues.toAdd.length) {
            apiCreate<Permission[]>("/permissions", props.token, {
                data: formValues.toAdd
            });
        }
        if (formValues.toRemove.length) {
            apiDelete<Permission[]>(`/permissions`, props.token, {
                data: formValues.toRemove
            });
        }

        console.log(perms);
        mutate({
            _items: perms,
            _meta: { total: perms.length }
        });
        perms = permBundle?._items || [];
        console.log(perms);

        setFormValues({
            isDirty: false,
            isSubmitting: false,
            isSubmitted: true,
            toAdd: blankPermissionList,
            toRemove: blankPermissionList
        });
    };

    return (
        <Dialog
            open={props.open}
            onClose={() => props.onCancel()}
            maxWidth="xl"
        >
            <DialogTitle>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    wrap="nowrap"
                >
                    <Grid item>
                        Editing data access for{" "}
                        <strong>
                            {props.grantee.first_n} {props.grantee.last_n}
                        </strong>
                    </Grid>
                    <Grid item>{loadingPerms && <Loader size={25} />}</Grid>
                </Grid>
                {tooManyPerms && (
                    <Alert severity="warning">
                        <strong>
                            Please remove a permission if you need to add
                            another.
                        </strong>{" "}
                        Due to Google Cloud Storage IAM limitations, a user can
                        have a maximum of {MAX_PERMS} separate permissions
                        granted to them.
                    </Alert>
                )}
            </DialogTitle>
            <DialogContent>
                {trials ? (
                    <form onSubmit={handleSubmit}>
                        <Table padding="checkbox" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.trialCell}>
                                        Trial
                                    </TableCell>
                                    <TableCell
                                        key={"clinical_data"}
                                        size="small"
                                        align="center"
                                    >
                                        <Grid
                                            container
                                            direction="row"
                                            alignItems="center"
                                        >
                                            <Grid item>Clinical</Grid>
                                            <Grid item>
                                                <PermCheckbox
                                                    grantee={props.grantee}
                                                    granter={props.granter}
                                                    perms={perms}
                                                    uploadType={"clinical_data"}
                                                    disableIfUnchecked={
                                                        tooManyPerms
                                                    }
                                                    loadingPerms={loadingPerms}
                                                    handleChange={handleChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    </TableCell>

                                    {props.supportedTypes.map(uploadType => (
                                        <TableCell
                                            key={uploadType}
                                            size="small"
                                            align="center"
                                        >
                                            <Grid
                                                container
                                                direction="row"
                                                alignItems="center"
                                            >
                                                <Grid item>{uploadType}</Grid>
                                                <Grid item>
                                                    <PermCheckbox
                                                        grantee={props.grantee}
                                                        granter={props.granter}
                                                        perms={perms}
                                                        uploadType={uploadType}
                                                        disableIfUnchecked={
                                                            tooManyPerms
                                                        }
                                                        loadingPerms={
                                                            loadingPerms
                                                        }
                                                        handleChange={
                                                            handleChange
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trials.map((trial: Trial) => (
                                    <TableRow key={trial.trial_id}>
                                        <TableCell
                                            className={classes.trialCell}
                                        >
                                            <Grid
                                                container
                                                justify="space-between"
                                                alignItems="center"
                                                wrap="nowrap"
                                            >
                                                <Grid item>
                                                    {trial.trial_id}
                                                </Grid>
                                                <Grid item>
                                                    <PermCheckbox
                                                        grantee={props.grantee}
                                                        granter={props.granter}
                                                        perms={perms}
                                                        trialId={trial.trial_id}
                                                        disableIfUnchecked={
                                                            tooManyPerms
                                                        }
                                                        loadingPerms={
                                                            loadingPerms
                                                        }
                                                        handleChange={
                                                            handleChange
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                        <TableCell
                                            key={
                                                "clinical_data" + trial.trial_id
                                            }
                                            align="center"
                                        >
                                            <PermCheckbox
                                                grantee={props.grantee}
                                                granter={props.granter}
                                                perms={perms}
                                                trialId={trial.trial_id}
                                                uploadType={"clinical_data"}
                                                disableIfUnchecked={
                                                    tooManyPerms
                                                }
                                                loadingPerms={loadingPerms}
                                                handleChange={handleChange}
                                            />
                                        </TableCell>
                                        {props.supportedTypes.map(typ => {
                                            return (
                                                <TableCell
                                                    key={typ + trial.trial_id}
                                                    align="center"
                                                >
                                                    <PermCheckbox
                                                        grantee={props.grantee}
                                                        granter={props.granter}
                                                        perms={perms}
                                                        trialId={trial.trial_id}
                                                        uploadType={typ}
                                                        disableIfUnchecked={
                                                            tooManyPerms
                                                        }
                                                        loadingPerms={
                                                            loadingPerms
                                                        }
                                                        handleChange={
                                                            handleChange
                                                        }
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button
                            type="submit"
                            data-testid={`submit`}
                            variant="contained"
                            color="primary"
                            disabled={
                                !formValues.isDirty || formValues.isSubmitting
                            }
                        >
                            {!formValues.isDirty && formValues.isSubmitted
                                ? "changes saved!"
                                : "save changes"}
                        </Button>
                    </form>
                ) : (
                    <Loader />
                )}
            </DialogContent>
        </Dialog>
    );
};

const PermCheckbox: React.FunctionComponent<{
    grantee: Account;
    granter: Account;
    trialId?: string;
    uploadType?: string;
    perms: Permission[];
    disableIfUnchecked: boolean;
    loadingPerms: boolean;
    handleChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({
    grantee,
    granter,
    trialId,
    uploadType,
    perms,
    disableIfUnchecked,
    loadingPerms,
    handleChange
}) => {
    const permMap = mapValues(
        groupBy(perms, p => String([p.trial_id, p.upload_type])),
        // there should only be one permission per group
        ps => ps[0]
    );
    const granularPerm = permMap[String([trialId, uploadType])];
    const broadPerm =
        uploadType !== "clinical_data"
            ? permMap[String([trialId, uploadType])] ||
              permMap[String([trialId, null])] ||
              permMap[String([null, uploadType])]
            : permMap[String([trialId, uploadType])] ||
              permMap[String([null, uploadType])];
    const perm = granularPerm || broadPerm;

    // Checkbox isChecked if permission exists in map
    // otherwise, make a shell to keep track of which checkbox triggers handleChange
    const isChecked: boolean = !!perm;
    if (!perm) {
        // @ts-ignore because perm is missing `id` and `_etag` fields
        perm = {
            granted_to_user: grantee.id,
            granted_by_user: granter.id,
            trial_id: trialId || null,
            upload_type: uploadType || null
        };
    } else {
        console.log(permMap);
        console.log(perm);
    }

    return (
        <Checkbox
            data-testid={`checkbox-${trialId}-${uploadType}`}
            disabled={
                loadingPerms ||
                (!perm && disableIfUnchecked) ||
                (!granularPerm && !!broadPerm)
            }
            value={JSON.stringify(perm)}
            onChange={handleChange}
            checked={isChecked}
        />
    );
};

export default UserPermissionsDialogWithInfo;
