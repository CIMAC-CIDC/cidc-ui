import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination
} from "@material-ui/core";

export interface IPaginatedTableProps {
    headers?: IHeader[];
    initialSorting?: ISortConfig;
    totalCount: number;
    getRowKey: (row: DataRow) => string | number;
    getNextN: (
        n: number,
        startingAt: number,
        sortConfig?: ISortConfig
    ) => DataRow[];
    handleRowClick?: (row: DataRow) => void;
    renderRow?: (row: DataRow) => React.ReactElement;
}

export interface IHeader {
    key: string;
    label: string;
    sortBy?: (row: any) => any;
    format?: (v: any) => string;
}

// TODO (maybe): refine this type
export type DataRow = any;

export interface ISortConfig extends IHeader {
    direction: "asc" | "desc";
}

const PaginatedTable: React.FC<IPaginatedTableProps> = props => {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [sortConfig, setSortConfig] = React.useState<ISortConfig | undefined>(
        props.initialSorting
    );

    const handleSortChange = (header: IHeader) => {
        const direction =
            sortConfig &&
            sortConfig.key === header.key &&
            sortConfig.direction === "asc"
                ? "desc"
                : "asc";
        setSortConfig({ ...header, direction });
    };

    const dataPage = props.getNextN(
        rowsPerPage,
        page * rowsPerPage,
        sortConfig
    );

    return (
        <>
            <Table>
                {props.headers && (
                    <TableHead>
                        <TableRow>
                            {props.headers.map(header => (
                                <TableCell key={header.key}>
                                    {sortConfig ? (
                                        <TableSortLabel
                                            active={
                                                sortConfig.key === header.key
                                            }
                                            direction={sortConfig.direction}
                                            onClick={() =>
                                                handleSortChange(header)
                                            }
                                        >
                                            {header.label}
                                        </TableSortLabel>
                                    ) : (
                                        header.label
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {dataPage.map(row => (
                        <TableRow
                            key={props.getRowKey(row)}
                            hover={!!props.handleRowClick}
                            onClick={() =>
                                props.handleRowClick &&
                                props.handleRowClick(row)
                            }
                        >
                            {props.renderRow
                                ? props.renderRow(row)
                                : props.headers
                                ? props.headers.map(header => (
                                      <TableCell key={header.key}>
                                          {header.format
                                              ? header.format(row[header.key])
                                              : row[header.key]}
                                      </TableCell>
                                  ))
                                : Object.values(row).map((v: any, i) => (
                                      <TableCell key={i}>
                                          {v.toString()}
                                      </TableCell>
                                  ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 25]}
                count={props.totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={(_, n) => setPage(n)}
                onChangeRowsPerPage={e =>
                    setRowsPerPage(parseInt(e.target.value, 10))
                }
            />
        </>
    );
};

export default PaginatedTable;
