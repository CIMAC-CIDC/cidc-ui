import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Grid,
    Typography
} from "@material-ui/core";

export interface IPaginatedTableProps {
    headers?: IHeader[];
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
    const [dataWillChange, setDataWillChange] = React.useState<boolean>(false);
    React.useEffect(() => setDataWillChange(false), [props.data]);

    return (
        <>
            <Table size="small">
                {props.headers && (
                    <TableHead>
                        <TableRow>
                            {props.headers.map(header => (
                                <TableCell key={header.key}>
                                    {props.onClickHeader ? (
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
                {props.data ? (
                    <TableBody>
                        {props.data.map(row => (
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
                ) : (
                    <Grid
                        container
                        style={{ padding: "1em" }}
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item>
                            <Typography color="textSecondary">
                                {props.data === undefined
                                    ? "Loading..."
                                    : "No data found for these filters."}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </Table>
            <TablePagination
                component="div"
                count={props.count}
                rowsPerPage={props.rowsPerPage}
                rowsPerPageOptions={[]}
                page={props.page}
                onChangePage={(_, n) => {
                    setDataWillChange(true);
                    props.onChangePage(n);
                }}
                backIconButtonProps={{
                    disabled: dataWillChange || props.page === 0
                }}
                nextIconButtonProps={{ disabled: dataWillChange }}
            />
        </>
    );
};

export default PaginatedTable;
