import React from "react";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import { colors } from "../../rootStyles";
import PaginatedTable, { IHeader } from "../generic/PaginatedTable";
import { makeStyles } from "@material-ui/core";
import { filtersToWhereClause, filterConfig } from "./BrowseFilesPage";
import { useQueryParams } from "use-query-params";
import { getFiles, IDataWithMeta } from "../../api/api";
import { withIdToken } from "../identity/AuthProvider";

const FILE_TABLE_PAGE_SIZE = 15;

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
    }
});

export interface IFileTableProps {
    history: any;
}

const FileTable: React.FC<IFileTableProps & { token: string }> = props => {
    const classes = useStyles();
    const filters = useQueryParams(filterConfig)[0];

    const [page, setPage] = React.useState<number>(0);
    const [data, setData] = React.useState<
        IDataWithMeta<DataFile[]> | undefined
    >(undefined);

    React.useEffect(() => {
        // TODO: handle total_count for this query!
        getFiles(props.token, {
            page: page + 1, // eve-sqlalchemy pagination starts at 1
            where: filtersToWhereClause(filters),
            max_results: FILE_TABLE_PAGE_SIZE
        }).then(files => setData(files));
    }, [filters, page, props.token]);

    const headers = [
        { key: "object_url", label: "File Name" },
        { key: "assay_type", label: "Type" },
        { key: "data_format", label: "Format" },
        {
            key: "uploaded_timestamp",
            label: "Date/Time Uploaded",
            format: (ts: number) =>
                new Date(ts).toLocaleString(LOCALE, DATE_OPTIONS),
            sortBy: (f: DataFile) => new Date(f.uploaded_timestamp),
            active: true,
            direction: "desc"
        } as IHeader
    ];

    return (
        <div className={classes.root}>
            <PaginatedTable
                sortable
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
            />
        </div>
    );
};

export default withIdToken<IFileTableProps>(FileTable);
