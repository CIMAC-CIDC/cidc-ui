import React from "react";
import { DataFile } from "../../../model/file";
import { colors } from "../../../rootStyles";
import PaginatedTable, { ISortConfig } from "../../generic/PaginatedTable";
import {
    makeStyles,
    TableCell,
    Button,
    Grid,
    Typography,
    Box
} from "@material-ui/core";
import { useQueryParam, NumberParam } from "use-query-params";
import { IApiPage } from "../../../api/api";
import { withIdToken } from "../../identity/AuthProvider";
import MuiRouterLink from "../../generic/MuiRouterLink";
import { IFilters, useFilterFacets } from "../shared/FilterProvider";
import BatchDownloadDialog from "../shared/BatchDownloadDialog";
import {
    formatDataCategory,
    formatDate,
    formatFileSize,
    formatQueryString
} from "../../../util/formatters";
import { useHistory } from "react-router-dom";
import useSWR from "swr";
import { useUserContext } from "../../identity/UserProvider";

const fileQueryDefaults = {
    page_size: 50
    // // Columns to omit from /downloadable_files queries.
    // // These columns may contain large JSON blobs
    // // that would slow the query down.
    // projection: {
    //     clustergrammer: 0,
    //     additional_metadata: 0
    // }
};

const useStyles = makeStyles({
    root: {
        "& .MuiTable-root": {
            border: `1px solid ${colors.LIGHT_GREY}`,
            borderRadius: 5,
            borderCollapse: "separate"
        },
        "& .MuiTableRow-root": {
            cursor: "pointer"
        }
    },
    checkbox: {
        padding: 0
    },
    checkboxCell: {
        paddingRight: 0
    }
});

export interface IFileTableProps {
    history: any;
    viewToggleButton: React.ReactElement;
}

export const filterParams = (filters: IFilters) => {
    const joinParam = (ps?: string[]) =>
        ps
            ? ps.length > 0
                ? encodeURIComponent(ps.join(","))
                : undefined
            : undefined;
    return {
        trial_ids: joinParam(filters.trial_ids),
        facets: joinParam(filters.facets)
    };
};

const BatchDownloadButton: React.FC<{
    ids: number[];
    token: string;
    clearIds: () => void;
}> = ({ ids, token, clearIds }) => {
    const [openDialog, setOpenDialog] = React.useState<boolean>(false);

    return (
        <Grid container spacing={1}>
            <Grid item>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={ids.length === 0}
                    disableRipple
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                >
                    {ids.length > 0
                        ? `Download ${ids.length} file${
                              ids.length !== 1 ? "s" : ""
                          }`
                        : "No files selected"}
                </Button>
            </Grid>
            {ids.length > 0 && (
                <Grid item>
                    <Button variant="outlined" onClick={() => clearIds()}>
                        Clear Selection
                    </Button>
                </Grid>
            )}
            <BatchDownloadDialog
                ids={ids}
                token={token}
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            />
        </Grid>
    );
};

export const ObjectURL: React.FC<{ file: DataFile }> = ({ file }) => {
    const history = useHistory();
    const paths = file.object_url.split("/");
    return (
        <MuiRouterLink
            to={`/browse-data/${file.id}`}
            state={{
                prevPath: history.location.pathname + history.location.search
            }}
        >
            <Grid container>
                {paths.map((p, i) => (
                    <Grid key={p} item>
                        {p}
                        {i === paths.length - 1 ? "" : "/"}
                    </Grid>
                ))}
            </Grid>
        </MuiRouterLink>
    );
};

const FileTable: React.FC<IFileTableProps & { token: string }> = props => {
    const classes = useStyles();
    const user = useUserContext();
    const { filters } = useFilterFacets();

    const [queryPage, setQueryPage] = useQueryParam("page", NumberParam);

    const [selectedFileIds, setSelectedFileIds] = React.useState<number[]>([]);

    const [sortConfig, setSortConfig] = React.useState<
        Omit<ISortConfig, "onSortChange">
    >({ key: "_created", direction: "desc" });

    const { data } = useSWR<IApiPage<DataFile>>([
        `/downloadable_files?${formatQueryString({
            page_num: queryPage || 0,
            sort_field: sortConfig.key,
            sort_direction: sortConfig.direction,
            ...filterParams(filters),
            ...fileQueryDefaults
        })}`,
        props.token
    ]);

    React.useEffect(() => {
        setQueryPage(0);
    }, [filters, sortConfig, setQueryPage]);

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    spacing={1}
                >
                    <Grid item>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <Box padding={1}>
                                    <Typography
                                        color="textSecondary"
                                        variant="caption"
                                    >
                                        {user.canDownload
                                            ? "Select files for batch download"
                                            : "Browse available files"}
                                    </Typography>
                                </Box>
                            </Grid>
                            {user.canDownload && (
                                <Grid item>
                                    <BatchDownloadButton
                                        ids={selectedFileIds}
                                        token={props.token}
                                        clearIds={() => setSelectedFileIds([])}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid item>{props.viewToggleButton}</Grid>
                </Grid>
            </Grid>
            <Grid item>
                <div className={classes.root}>
                    <PaginatedTable
                        count={data?._meta.total || 0}
                        page={queryPage || 0}
                        onChangePage={p => setQueryPage(p)}
                        rowsPerPage={fileQueryDefaults.page_size}
                        sortConfig={{
                            ...sortConfig,
                            onSortChange: (key, direction) =>
                                setSortConfig({ key, direction })
                        }}
                        headers={[
                            {
                                key: "object_url",
                                label: "File Name"
                            },
                            {
                                key: "trial_id",
                                label: "Protocol ID"
                            },
                            { key: "file_ext", label: "Format" },
                            { key: "data_category", label: "Category" },
                            {
                                key: "file_size_bytes",
                                label: "Size"
                            },
                            {
                                key: "uploaded_timestamp",
                                label: "Date/Time Uploaded"
                            }
                        ]}
                        data={data?._items}
                        getRowKey={row => row.id}
                        renderRowContents={row => {
                            return (
                                <>
                                    <TableCell>
                                        <ObjectURL file={row} />
                                    </TableCell>
                                    <TableCell>{row.trial_id}</TableCell>
                                    <TableCell>{row.file_ext}</TableCell>
                                    <TableCell>
                                        {formatDataCategory(
                                            row.data_category || ""
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatFileSize(row.file_size_bytes)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(row.uploaded_timestamp)}
                                    </TableCell>
                                </>
                            );
                        }}
                        {
                            // Rows should only be selectable if the user has download perms
                            ...(user.canDownload && {
                                selectedRowIds: selectedFileIds,
                                setSelectedRowIds: setSelectedFileIds,
                                onClickRow: file => {
                                    const newSelectedFileIds = selectedFileIds.includes(
                                        file.id
                                    )
                                        ? selectedFileIds.filter(
                                              id => id !== file.id
                                          )
                                        : [...selectedFileIds, file.id];
                                    setSelectedFileIds(newSelectedFileIds);
                                }
                            })
                        }
                    />
                </div>
            </Grid>
        </Grid>
    );
};

export default withIdToken<IFileTableProps>(FileTable);
