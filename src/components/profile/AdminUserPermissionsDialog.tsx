import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    TableHead,
    FormControl,
    Checkbox,
    Grid,
    makeStyles
} from "@material-ui/core";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import { IApiPage } from "../../api/api";
import { Trial } from "../../model/trial";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
import { InfoContext } from "../info/InfoProvider";
import Loader from "../generic/Loader";
import { UserContext } from "../identity/UserProvider";
import useSWR from "swr";
import { widths } from "../../rootStyles";
import { apiCreate, apiDelete } from "../../api/api";

export interface IUserPermissionsDialogProps {
    open: boolean;
    grantee: Account;
    token: string;
    onCancel: () => void;
}

const ROWS_PER_PAGE = 50;
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
    dialogContent: { width: widths.minPageWidth, height: 600 },
    trialCell: {
        position: "sticky",
        background: theme.palette.background.default,
        left: -24,
        zIndex: 100
    },
    tablePagination: { position: "sticky", left: 0 }
}));

const UserPermissionsDialog: React.FC<IUserPermissionsDialogProps & {
    supportedTypes: string[];
    granter: Account;
}> = props => {
    const classes = useStyles();
    const [page, setPage] = React.useState<number>(0);

    const { data: trialBundle } = useSWR<IApiPage<Trial>>(
        props.open ? ["/trial_metadata?page_size=200", props.token] : null
    );
    const trials = trialBundle?._items;
    const { data: permissionBundle, mutate, isValidating } = useSWR<
        IApiPage<Permission>
    >(
        props.open
            ? [`/permissions?user_id=${props.grantee.id}`, props.token]
            : null
    );
    const permissions = permissionBundle?._items;

    const makeHandleChange = (trial: string, assay: string) => {
        return async (
            e: React.ChangeEvent<HTMLInputElement>,
            perm?: Permission
        ) => {
            const checked = e.currentTarget.checked;
            if (checked) {
                const newPerm = {
                    granted_to_user: props.grantee.id,
                    granted_by_user: props.granter.id,
                    trial_id: trial,
                    upload_type: assay
                };
                apiCreate<Permission>("/permissions", props.token, {
                    data: newPerm
                });
                mutate({
                    _meta: { total: (permissionBundle?._meta.total || 0) + 1 },
                    // @ts-ignore because newPerm is missing `id` and `_etag` fields
                    _items: [...(permissionBundle?._items || []), newPerm]
                });
            } else if (!checked && perm) {
                apiDelete<Permission>(`/permissions/${perm.id}`, props.token, {
                    etag: perm._etag
                });
                mutate({
                    _items:
                        permissionBundle?._items.filter(
                            p => p.id !== perm.id
                        ) || [],
                    _meta: { total: permissionBundle?._meta.total || 0 }
                });
            }
        };
    };

    const userName = `${props.grantee.first_n} ${props.grantee.last_n}`;
    if (!permissions) {
        return null;
    }
    // Create a mapping from trial ID -> assay type -> permission
    const permissionsMap = mapValues(
        groupBy(permissions, p => p.trial_id),
        trialGroup =>
            trialGroup.reduce((acc, p) => ({ ...acc, [p.upload_type]: p }), {})
    );

    return (
        <Dialog open={props.open} onClose={() => props.onCancel()}>
            <DialogTitle>
                <Grid container direction="row" justify="space-between">
                    <Grid item>
                        Editing data access for <strong>{userName}</strong>
                    </Grid>
                    <Grid item>{isValidating && <Loader size={25} />}</Grid>
                </Grid>
            </DialogTitle>
            {!trials && <Loader />}
            <DialogContent className={classes.dialogContent}>
                {trials && (
                    <div>
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
                                {trials
                                    .slice(
                                        page * ROWS_PER_PAGE,
                                        page * ROWS_PER_PAGE + ROWS_PER_PAGE
                                    )
                                    .map((trial: Trial) => (
                                        <TableRow key={trial.trial_id}>
                                            <TableCell
                                                className={classes.trialCell}
                                            >
                                                {trial.trial_id}
                                            </TableCell>
                                            {props.supportedTypes.map(typ => {
                                                return (
                                                    <AssayCheckbox
                                                        key={
                                                            typ + trial.trial_id
                                                        }
                                                        trialID={trial.trial_id}
                                                        assayType={typ}
                                                        permissionsMap={
                                                            permissionsMap
                                                        }
                                                        onChange={makeHandleChange(
                                                            trial.trial_id,
                                                            typ
                                                        )}
                                                        isRefreshing={
                                                            isValidating
                                                        }
                                                    />
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {trials && (
                    <TablePagination
                        className={classes.tablePagination}
                        component="div"
                        count={trialBundle?._meta.total || 0}
                        rowsPerPage={ROWS_PER_PAGE}
                        page={page}
                        onChangePage={(e, p) => setPage(p)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

const AssayCheckbox: React.FunctionComponent<{
    trialID: string;
    assayType: string;
    permissionsMap: {
        [trial: string]: { [assay: string]: Permission };
    };
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        permission?: Permission
    ) => void;
    isRefreshing: boolean;
}> = ({ trialID, assayType, permissionsMap, onChange, isRefreshing }) => {
    const isChecked =
        trialID in permissionsMap && assayType in permissionsMap[trialID];

    const permission = permissionsMap[trialID]
        ? permissionsMap[trialID][assayType]
        : undefined;

    return (
        <TableCell>
            <FormControl>
                <Checkbox
                    data-testid={`checkbox-${trialID}-${assayType}`}
                    checked={isChecked}
                    onChange={e => {
                        onChange(e, permission);
                    }}
                    disabled={isRefreshing}
                />
            </FormControl>
        </TableCell>
    );
};

export default UserPermissionsDialogWithInfo;
