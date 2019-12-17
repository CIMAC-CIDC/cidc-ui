import React from "react";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import { colors } from "../../rootStyles";
import PaginatedTable, { ISortConfig } from "../generic/PaginatedTable";
import orderBy from "lodash/orderBy";
import { makeStyles } from "@material-ui/core";

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
    files: DataFile[];
    trials: string[];
    history: any;
}

const FileTable: React.FC<IFileTableProps> = props => {
    const classes = useStyles();

    const uploadTimeHeader = {
        key: "uploaded_timestamp",
        label: "Date/Time Uploaded",
        format: (ts: number) =>
            new Date(ts).toLocaleString(LOCALE, DATE_OPTIONS),
        sortBy: (f: DataFile) => new Date(f.uploaded_timestamp)
    };
    const headers = [
        { key: "object_url", label: "File Name" },
        { key: "trial", label: "Protocol Identifier" },
        { key: "assay_type", label: "Type" },
        { key: "data_format", label: "Format" },
        uploadTimeHeader
    ];

    return (
        <div className={classes.root}>
            <PaginatedTable
                headers={headers}
                totalCount={props.files.length}
                initialSorting={{ ...uploadTimeHeader, direction: "desc" }}
                getRowKey={row => row.id}
                getNextN={(
                    n: number,
                    startingAt: number,
                    sortConfig?: ISortConfig
                ) => {
                    // `sortConfig` will be defined here
                    return sortConfig
                        ? orderBy(
                              props.files,
                              sortConfig.sortBy || sortConfig.key,
                              sortConfig.direction
                          ).slice(startingAt, startingAt + n)
                        : [];
                }}
                handleRowClick={row =>
                    props.history.push("/file-details/" + row.id)
                }
            />
        </div>
    );
};

export default FileTable;
