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
    sortable?: boolean;
    data?: DataRow[];
    count: number;
    page: number;
    rowsPerPage: number;
    getRowKey: (row: DataRow) => string | number;
    onChangePage: (page: number) => void;
    onClickHeader?: (header: IHeader) => void;
    onClickRow?: (row: DataRow) => void;
    renderRow?: (row: DataRow) => React.ReactElement;
}

export interface IHeader {
    key: string;
    label: string;
    sortBy?: (row: any) => any;
    format?: (v: any) => string;
    active?: boolean;
    direction?: "asc" | "desc";
}

// TODO (maybe): refine this type
export type DataRow = any;

const PaginatedTable: React.FC<IPaginatedTableProps> = props => {
    return (
        <>
            <Table size="small">
                {props.headers && (
                    <TableHead>
                        <TableRow>
                            {props.headers.map(header => (
                                <TableCell key={header.key}>
                                    {props.sortable ? (
                                        <TableSortLabel
                                            active={header.active}
                                            direction={header.direction}
                                            onClick={() =>
                                                props.onClickHeader &&
                                                props.onClickHeader(header)
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
                    {props.data &&
                        props.data.map(row => (
                            <TableRow
                                key={props.getRowKey(row)}
                                hover={!!props.onClickRow}
                                onClick={() =>
                                    props.onClickRow && props.onClickRow(row)
                                }
                            >
                                {props.renderRow
                                    ? props.renderRow(row)
                                    : props.headers
                                    ? props.headers.map(header => (
                                          <TableCell key={header.key}>
                                              {header.format
                                                  ? header.format(
                                                        row[header.key]
                                                    )
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
                count={props.count}
                rowsPerPage={props.rowsPerPage}
                rowsPerPageOptions={[]}
                page={props.page}
                onChangePage={(_, n) => props.onChangePage(n)}
            />
        </>
    );
};

export default PaginatedTable;
