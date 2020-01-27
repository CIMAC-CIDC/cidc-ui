import React from "react";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import { colors } from "../../rootStyles";
import PaginatedTable, { IHeader } from "../generic/PaginatedTable";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { filterConfig, Filters } from "./FileFilter";
import { useQueryParams } from "use-query-params";
import { getFiles, IDataWithMeta } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";

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
        fontSize: "inherit"
    }
});

export interface IFileTableProps {
    history: any;
}

export const filtersToWhereClause = (filters: Filters): string => {
    const arraySubclause = (ids: any, key: string) =>
        !!ids && `(${ids.map((id: string) => `${key}=="${id}"`).join(" or ")})`;
    const subclauses = [
        arraySubclause(filters.protocol_id, "trial"),
        arraySubclause(filters.type, "upload_type"),
        arraySubclause(filters.data_format, "data_format")
    ];

    return subclauses.filter(c => !!c).join(" and ");
};

export const headerToSortClause = (header: IHeader): string => {
    return `[("${header.key}", ${header.direction === "asc" ? 1 : -1})]`;
};

const FileTable: React.FC<IFileTableProps & { token: string }> = props => {
    const classes = useStyles();
    const filters = useQueryParams(filterConfig)[0];

    const [page, setPage] = React.useState<number>(0);
    const [data, setData] = React.useState<
        IDataWithMeta<DataFile[]> | undefined
    >(undefined);

    const [headers, setHeaders] = React.useState<IHeader[]>([
        {
            key: "object_url",
            label: "File",
            format: (name: string) => {
                const parts = name.split("/");
                const lastPartIndex = parts.length - 1;
                return (
                    <Grid container spacing={1}>
                        {parts.flatMap((part, i) => (
                            <React.Fragment key={part}>
                                <Grid item>{part}</Grid>
                                {i !== lastPartIndex && (
                                    <Grid item>
                                        <Typography
                                            className={classes.forwardSlash}
                                            color="textSecondary"
                                        >
                                            /
                                        </Typography>
                                    </Grid>
                                )}
                            </React.Fragment>
                        ))}
                    </Grid>
                );
            }
        },
        {
            key: "uploaded_timestamp",
            label: "Date/Time Uploaded",
            format: (ts: number) =>
                new Date(ts).toLocaleString(LOCALE, DATE_OPTIONS),
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
        }).then(files => setData(files));
    }, [filters, page, props.token, sortHeader]);

    return (
        <div className={classes.root}>
            <PaginatedTable
                count={data ? data.meta.total : 0}
                page={page}
                onChangePage={p => setPage(p)}
                rowsPerPage={FILE_TABLE_PAGE_SIZE}
                headers={headers}
                data={data && data.data}
                getRowKey={row => row.id}
                onClickRow={row =>
                    props.history.push("/file-details/" + row.id)
                }
                onClickHeader={header => {
                    const newHeaders = headers.map(h => {
                        const newHeader = { ...h };
                        if (h.key === header.key) {
                            if (h.active) {
                                newHeader.direction =
                                    h.direction === "desc" ? "asc" : "desc";
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
        </div>
    );
};

export default withIdToken<IFileTableProps>(FileTable);
