import React from "react";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import { colors } from "../../rootStyles";
import PaginatedTable, { IHeader } from "../generic/PaginatedTable";
import {
    makeStyles,
    Typography,
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

const fileQueryDefaults = {
    max_results: 15,
    // Columns to omit from `getFiles` queries.
    // These columns may contain large JSON blobs
    // that would slow the query down.
    projection: {
        clustergrammer: 0,
        additional_metadata: 0
    }
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
    forwardSlash: {
        fontSize: "inherit",
        display: "inline"
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

export const filtersToWhereClause = (filters: Filters): string => {
    const arraySubclause = (ids: any, key: string) =>
        !!ids && `(${ids.map((id: string) => `${key}=="${id}"`).join(" or ")})`;
    const subclauses = [
        arraySubclause(filters.trial_id, "trial_id"),
        arraySubclause(filters.upload_type, "upload_type"),
        !filters.raw_files && "(analysis_friendly==true)"
    ];

    return subclauses.filter(c => !!c).join(" and ");
};

export const headerToSortClause = (header: IHeader): string => {
    return `[("${header.key}", ${header.direction === "asc" ? 1 : -1})]`;
};

export const triggerBatchDownload = async (
    token: string,
    fileIds: string[],
    callback: () => void = () => null
) => {
    const urls = await Promise.all(
        fileIds.map(id => getDownloadURL(token, id))
    );

    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
        if (urls.length === 0) {
            clearInterval(interval);
            callback();
        }
        const url = urls.pop();
        window.open(url, "_parent");
    }, 300);
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

const FileTable: React.FC<IFileTableProps & { token: string }> = props => {
    const classes = useStyles();

    const filters = useQueryParams(filterConfig)[0];
    const whereClause = filtersToWhereClause(filters);

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
            label: "File"
        },
        {
            key: "uploaded_timestamp",
            label: "Date/Time Uploaded",
            active: true,
            direction: "desc"
        } as IHeader
    ]);
    const sortClause = headerToSortClause(headers.filter(h => h.active)[0]);

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
            getFiles(props.token, {
                page: queryPage + 1, // eve-sqlalchemy pagination starts at 1
                where: whereClause,
                sort: sortClause,
                ...fileQueryDefaults
            }).then(files => {
                // Check if queryPage is too high for the current filters.
                if (
                    queryPage * fileQueryDefaults.max_results >
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
            });
        }
        // Track which page we're switching from.
        setPrevPage(queryPage);

        // If we include prevPage in the useEffect dependencies, this
        // effect will rerun until queryPage == prevPage, preventing
        // the component from remaining in a state where queryPage != 0.
        // TODO: maybe there's a refactor that prevents this issue.
        // eslint-disable-next-line
    }, [props.token, whereClause, sortClause, queryPage, setQueryPage]);

    const formatObjectURL = (row: DataFile) => {
        const parts = row.object_url.split("/");
        const lastPartIndex = parts.length - 1;
        return (
            <MuiRouterLink
                to={`/file-details/${row.id}`}
                LinkProps={{ color: "initial" }}
            >
                {parts.flatMap((part, i) => (
                    <React.Fragment key={part}>
                        {part}
                        {i !== lastPartIndex && (
                            <Typography
                                className={classes.forwardSlash}
                                color="textSecondary"
                            >
                                {" "}
                                /{" "}
                            </Typography>
                        )}
                    </React.Fragment>
                ))}
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
                        rowsPerPage={fileQueryDefaults.max_results}
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
