import React from "react";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import { colors } from "../../rootStyles";
import PaginatedTable, { IHeader } from "../generic/PaginatedTable";
import {
    makeStyles,
    TableCell,
    Checkbox,
    Button,
    CircularProgress,
    Grid
} from "@material-ui/core";
import { filterConfig, Filters } from "./FileFilter";
import { useQueryParams, useQueryParam, NumberParam } from "use-query-params";
import { getFiles, IDataWithMeta, getDownloadURL } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";
import MuiRouterLink from "../generic/MuiRouterLink";
import { CloudDownload } from "@material-ui/icons";
import axios, { CancelTokenSource } from "axios";
import filesize from "filesize";

const fileQueryDefaults = {
    page_size: 15
    // // Columns to omit from `getFiles` queries.
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
}

export const filterParams = (filters: Filters) => {
    return {
        trial_ids: filters.trial_ids?.join(","),
        facets: filters.facets?.join(",")
    };
};

export const sortParams = (header?: IHeader) => {
    return (
        header && {
            sort_field: header?.key,
            sort_direction: header?.direction
        }
    );
};

export const triggerBatchDownload = async (
    token: string,
    fileIds: string[],
    callback: () => void = () => null
) => {
    const urls = await Promise.all(
        fileIds.map(id => getDownloadURL(token, id))
    );

    urls.map(url => window.open(url, "_blank"));
    callback();
};

const BatchDownloadButton: React.FC<{
    ids: string[];
    token: string;
    onComplete: () => void;
}> = ({ ids, token, onComplete }) => {
    const [downloading, setDownloading] = React.useState<boolean>(false);

    return (
        <Button
            variant="contained"
            color="primary"
            disabled={!ids.length || downloading}
            disableRipple
            onClick={() => {
                setDownloading(true);
                triggerBatchDownload(token, ids).then(() => {
                    onComplete();
                    setDownloading(false);
                });
            }}
            startIcon={<CloudDownload />}
            endIcon={
                downloading && <CircularProgress size={12} color="inherit" />
            }
        >
            {ids.length
                ? `Download ${ids.length} file${ids.length > 1 ? "s" : ""}`
                : "Select files for batch download"}
        </Button>
    );
};

const CANCEL_MESSAGE = "cancelling stale filter request";

const FileTable: React.FC<IFileTableProps & { token: string }> = props => {
    const classes = useStyles();
    const axiosCanceller = React.useRef<CancelTokenSource | undefined>();

    const filters = useQueryParams(filterConfig)[0];

    const [maybeQueryPage, setQueryPage] = useQueryParam("page", NumberParam);
    const queryPage = maybeQueryPage || 0;
    const [tablePage, setTablePage] = React.useState<number>(0);
    const [prevPage, setPrevPage] = React.useState<number | null>();

    const [data, setData] = React.useState<
        IDataWithMeta<DataFile[]> | undefined
    >(undefined);
    const [checked, setChecked] = React.useState<string[]>([]);
    const [headers, setHeaders] = React.useState<IHeader[]>([
        { key: "", label: "", disableSort: true },
        {
            key: "object_url",
            label: "File Name"
        },
        {
            key: "trial_id",
            label: "Protocol ID"
        },
        { key: "file_ext", label: "Data Format" },
        {
            key: "file_size_bytes",
            label: "Size"
        },
        {
            key: "uploaded_timestamp",
            label: "Date/Time Uploaded",
            active: true,
            direction: "desc"
        } as IHeader
    ]);
    const sortHeader = headers.find(h => h.active);

    React.useEffect(() => {
        if (queryPage === prevPage && prevPage !== 0) {
            // Reset the query page to 0, since the user has either
            // changed the filtering or the sorting.
            // NOTE: This change doesn't update the file table.
            setQueryPage(0);
        } else if (queryPage < 0) {
            // A negative queryPage is invalid
            setQueryPage(0);
        } else {
            // Clear existing data, so the table shows a loading indicator
            setData(undefined);

            // Cancel the previous request, if one is ongoing
            if (axiosCanceller.current) {
                axiosCanceller.current.cancel(CANCEL_MESSAGE);
            }

            axiosCanceller.current = axios.CancelToken.source();

            getFiles(
                props.token,
                {
                    page_num: queryPage,
                    ...filterParams(filters),
                    ...sortParams(sortHeader),
                    ...fileQueryDefaults
                },
                axiosCanceller.current.token
            )
                .then(files => {
                    // Check if queryPage is too high for the current filters.
                    if (
                        queryPage * fileQueryDefaults.page_size >
                        files.meta.total
                    ) {
                        // queryPage is out of bounds, so reset to 0.
                        setQueryPage(0);
                    } else {
                        // De-select all selected files.
                        setChecked([]);

                        // Update the page in the file table.
                        setTablePage(queryPage);

                        // Push the new data to the table.
                        setData(files);
                    }
                })
                .catch(err => {
                    if (err.message !== CANCEL_MESSAGE) {
                        console.error(err.message);
                    }
                });
        }
        // Track which page we're switching from.
        setPrevPage(queryPage);

        // If we include prevPage in the useEffect dependencies, this
        // effect will rerun until queryPage == prevPage, preventing
        // the component from remaining in a state where queryPage != 0.
        // TODO: maybe there's a refactor that prevents this issue.
        // eslint-disable-next-line
    }, [props.token, filters, sortHeader, queryPage, setQueryPage]);

    const formatObjectURL = (row: DataFile) => {
        const paths = row.object_url.split("/");
        const fileName = paths[paths.length - 1];
        const prefix = paths.slice(0, paths.length - 1).join("/");
        return (
            <MuiRouterLink to={`/file-details/${row.id}`}>
                <div style={{ textDecoration: "underline" }}>
                    <div>{prefix}/</div>
                    <div>{fileName}</div>
                </div>
            </MuiRouterLink>
        );
    };

    const formatUploadTimestamp = (row: DataFile) =>
        new Date(row.uploaded_timestamp).toLocaleString(LOCALE, DATE_OPTIONS);

    return (
        <div className={classes.root}>
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <BatchDownloadButton
                        ids={checked}
                        token={props.token}
                        onComplete={() => setChecked([])}
                    />
                </Grid>
                <Grid item>
                    <PaginatedTable
                        count={data ? data.meta.total : 0}
                        page={tablePage}
                        onChangePage={p => setQueryPage(p)}
                        rowsPerPage={fileQueryDefaults.page_size}
                        headers={headers}
                        data={data && data.data}
                        getRowKey={row => row.id}
                        renderRowContents={row => {
                            return (
                                <>
                                    <TableCell className={classes.checkboxCell}>
                                        <Checkbox
                                            className={classes.checkbox}
                                            size="small"
                                            checked={checked.includes(row.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {formatObjectURL(row)}
                                    </TableCell>
                                    <TableCell>{row.trial_id}</TableCell>
                                    <TableCell>{row.file_ext}</TableCell>
                                    <TableCell>
                                        {filesize(row.file_size_bytes)}
                                    </TableCell>
                                    <TableCell>
                                        {formatUploadTimestamp(row)}
                                    </TableCell>
                                </>
                            );
                        }}
                        onClickRow={row => {
                            const newChecked = checked.includes(row.id)
                                ? checked.filter(id => id !== row.id)
                                : [...checked, row.id];
                            setChecked(newChecked);
                        }}
                        onClickHeader={header => {
                            const newHeaders = headers.map(h => {
                                const newHeader = { ...h };
                                if (h.key === header.key) {
                                    if (h.active) {
                                        newHeader.direction =
                                            h.direction === "desc"
                                                ? "asc"
                                                : "desc";
                                    } else {
                                        newHeader.active = true;
                                        newHeader.direction = "desc";
                                    }
                                } else {
                                    newHeader.active = false;
                                }
                                return newHeader;
                            });
                            setHeaders(newHeaders);
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default withIdToken<IFileTableProps>(FileTable);
