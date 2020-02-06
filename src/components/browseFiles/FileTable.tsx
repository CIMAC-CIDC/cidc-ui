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
import { useQueryParams } from "use-query-params";
import { getFiles, IDataWithMeta, getDownloadURL } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";
import MuiRouterLink from "../generic/MuiRouterLink";
import { CloudDownload } from "@material-ui/icons";

const FILE_TABLE_PAGE_SIZE = 15;

// Columns to omit from `getFiles` queries.
// These columns may contain large JSON blobs
// that would slow the query down.
const FILE_TABLE_QUERY_PROJECTION = {
    clustergrammer: 0,
    additional_metadata: 0
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

    const [page, setPage] = React.useState<number>(0);
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
    const sortHeader = headers.filter(h => h.active)[0];

    React.useEffect(() => {
        getFiles(props.token, {
            page: page + 1, // eve-sqlalchemy pagination starts at 1
            where: filtersToWhereClause(filters),
            max_results: FILE_TABLE_PAGE_SIZE,
            sort: headerToSortClause(sortHeader),
            projection: FILE_TABLE_QUERY_PROJECTION
        }).then(files => {
            setData(files);
            setChecked([]);
        });
    }, [filters, page, props.token, sortHeader]);

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
                        page={page}
                        onChangePage={p => setPage(p)}
                        rowsPerPage={FILE_TABLE_PAGE_SIZE}
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
