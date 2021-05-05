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
    Grid
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
    const perms = swrResults.data?._items || [];

    const permMap = React.useMemo(
        () =>
            mapValues(
                groupBy(perms, p => String([p.trial_id, p.upload_type])),
                // there should only be one permission per group
                ps => ps[0]
            ),
        [perms]
    );

    return {
        ...swrResults,
        getGranularPermission: (trialId?: string, uploadType?: string) =>
            permMap[String([trialId, uploadType])],
        getBroadPermission: (trialId?: string, uploadType?: string) =>
            permMap[String([trialId, uploadType])] ||
            permMap[String([trialId, undefined])] ||
            permMap[String([undefined, uploadType])]
    };
};

const MAX_PERMS = 20;

const UserPermissionsDialog: React.FC<IUserPermissionsDialogProps & {
    supportedTypes: string[];
    granter: Account;
}> = props => {
    const classes = useStyles();

    const { data: permBundle, isValidating: loadingPerms } = usePermissions(
        props.token,
        props.grantee
    );
    const tooManyPerms = (permBundle?._items || []).length >= MAX_PERMS;

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
                    <Table padding="checkbox" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.trialCell}>
                                    Trial
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
                                                    uploadType={uploadType}
                                                    token={props.token}
                                                    disableIfUnchecked={
                                                        tooManyPerms
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
                                    <TableCell className={classes.trialCell}>
                                        <Grid
                                            container
                                            justify="space-between"
                                            alignItems="center"
                                            wrap="nowrap"
                                        >
                                            <Grid item>{trial.trial_id}</Grid>
                                            <Grid item>
                                                <PermCheckbox
                                                    grantee={props.grantee}
                                                    granter={props.granter}
                                                    trialId={trial.trial_id}
                                                    token={props.token}
                                                    disableIfUnchecked={
                                                        tooManyPerms
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
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
                                                    trialId={trial.trial_id}
                                                    uploadType={typ}
                                                    token={props.token}
                                                    disableIfUnchecked={
                                                        tooManyPerms
                                                    }
                                                />
                                            </TableCell>
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
    trialId?: string;
    uploadType?: string;
    disableIfUnchecked: boolean;
}> = ({ grantee, granter, token, trialId, uploadType, disableIfUnchecked }) => {
    const {
        data,
        mutate,
        isValidating,
        getGranularPermission,
        getBroadPermission
    } = usePermissions(token, grantee);
    const granularPerm = getGranularPermission(trialId, uploadType);
    const broadPerm = getBroadPermission(trialId, uploadType);
    const perm = granularPerm || broadPerm;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        if (e.currentTarget.checked) {
            const newPerm = {
                granted_to_user: grantee.id,
                granted_by_user: granter.id,
                trial_id: trialId,
                upload_type: uploadType
            };
            apiCreate<Permission>("/permissions", token, {
                data: newPerm
            });
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
        <Checkbox
            data-testid={`checkbox-${trialId}-${uploadType}`}
            disabled={
                isValidating ||
                (!perm && disableIfUnchecked) ||
                (!granularPerm && !!broadPerm)
            }
            onChange={handleChange}
            checked={!!perm}
        />
    );
};

export default UserPermissionsDialogWithInfo;
