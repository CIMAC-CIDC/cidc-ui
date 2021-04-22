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
    FormControl,
    Checkbox,
    makeStyles,
    Grid,
    Typography
} from "@material-ui/core";
import { apiCreate, apiDelete, IApiPage } from "../../api/api";
import { Trial } from "../../model/trial";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
import { InfoContext } from "../info/InfoProvider";
import Loader from "../generic/Loader";
import { UserContext } from "../identity/UserProvider";
import useSWR from "swr";

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
    return useSWR<IApiPage<Permission>>([
        `/permissions?user_id=${grantee.id}`,
        token
    ]);
};

const UserPermissionsDialog: React.FC<IUserPermissionsDialogProps & {
    supportedTypes: string[];
    granter: Account;
}> = props => {
    const classes = useStyles();

    const { isValidating: loadingPerms } = usePermissions(
        props.token,
        props.grantee
    );

    const { data: trialBundle } = useSWR<IApiPage<Trial>>(
        props.open ? ["/trial_metadata?page_size=200", props.token] : null
    );
    const trials = trialBundle?._items;

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
                        <br />
                        <Typography variant="caption">
                            Note: due to Google Cloud Storage IAM limitations, a
                            user can have a maximum of 20 separate permissions.
                            A trial- or assay-wide permission counts as only one
                            permission.
                        </Typography>
                    </Grid>
                    <Grid item>{loadingPerms && <Loader />}</Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {trials ? (
                    <Table padding="checkbox" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.trialCell}>
                                    Trial
                                </TableCell>
                                {props.supportedTypes.map(typ => (
                                    <TableCell key={typ} size="small">
                                        {typ}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trials.map((trial: Trial) => (
                                <TableRow key={trial.trial_id}>
                                    <TableCell className={classes.trialCell}>
                                        {trial.trial_id}
                                    </TableCell>
                                    {props.supportedTypes.map(typ => {
                                        return (
                                            <PermCheckbox
                                                key={typ + trial.trial_id}
                                                grantee={props.grantee}
                                                granter={props.granter}
                                                trialId={trial.trial_id}
                                                uploadType={typ}
                                                token={props.token}
                                            />
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
    token: string;
    trialId: string;
    uploadType: string;
}> = ({ grantee, granter, token, trialId, uploadType }) => {
    const { data, mutate, isValidating } = usePermissions(token, grantee);
    const perm = data?._items.find(
        p => p.trial_id === trialId && p.upload_type === uploadType
    );

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        if (e.currentTarget.checked) {
            const newPerm = {
                granted_to_user: grantee.id,
                granted_by_user: granter.id,
                trial_id: trialId,
                upload_type: uploadType
            };
            apiCreate<Permission>("/permissions", token, { data: newPerm });
            mutate({
                _meta: { total: (data?._meta.total || 0) + 1 },
                // @ts-ignore because newPerm is missing `id` and `_etag` fields
                _items: [...(data?._items || []), newPerm]
            });
        } else if (perm) {
            apiDelete<Permission>(`/permissions/${perm.id}`, token, {
                etag: perm._etag
            });
            mutate({
                _items: data?._items.filter(p => p.id !== perm.id) || [],
                _meta: { total: data?._meta.total || 0 }
            });
        }
    };

    return (
        <TableCell>
            <FormControl>
                <Checkbox
                    data-testid={`checkbox-${trialId}-${uploadType}`}
                    disabled={isValidating}
                    checked={!!perm}
                    onChange={handleChange}
                />
            </FormControl>
        </TableCell>
    );
};

export default UserPermissionsDialogWithInfo;
