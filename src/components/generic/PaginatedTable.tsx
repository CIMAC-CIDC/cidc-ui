import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Typography,
    makeStyles,
    Box,
    Checkbox,
    Tooltip
} from "@material-ui/core";
import { intersection, union, difference, range } from "lodash";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles({
    row: {
        cursor: "auto !important"
    },
    checkbox: {
        padding: 0
    },
    checkboxCell: {
        paddingRight: 0
    }
});

const RowsPlaceholder: React.FC<{ numCols?: number }> = ({ numCols = 5 }) => {
    return (
        <>
            {range(5).map(i => (
                <TableRow key={i} data-testid="placeholder-row">
                    <TableCell>
                        <Skeleton width={10} />
                    </TableCell>
                    {range(numCols).map(c => (
                        <TableCell key={c}>
                            <Skeleton width={75} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
};

export interface IRowWithId {
    id: number;
}

export interface IPaginatedTableProps<T extends IRowWithId> {
    headers?: IHeader[];
    data?: T[];
    count: number;
    page: number;
    rowsPerPage: number;
    getRowKey: (row: T) => string | number;
    onChangePage: (page: number) => void;
    onClickHeader?: (header: IHeader) => void;
    onClickRow?: (row: T) => void;
    renderRowContents?: (row: T) => React.ReactElement;
    selectedRowIds?: number[];
    setSelectedRowIds?: (rows: number[]) => void;
}

export interface IHeader {
    key: string;
    label: string | React.ReactElement;
    format?: (v: any) => string | React.ReactElement;
    active?: boolean;
    direction?: "asc" | "desc";
    disableSort?: boolean;
}

function PaginatedTable<T extends IRowWithId>(props: IPaginatedTableProps<T>) {
    const classes = useStyles();

    const pageIds = props.data ? props.data.map(d => d.id) : undefined;
    const selectedPageIds =
        props.selectedRowIds && pageIds
            ? intersection(props.selectedRowIds, pageIds)
            : [];
    const allSelected = selectedPageIds?.length === props.rowsPerPage;
    const toggleSelectAll = () => {
        if (props.selectedRowIds && props.setSelectedRowIds && pageIds) {
            if (allSelected) {
                props.setSelectedRowIds(
                    difference(props.selectedRowIds, pageIds)
                );
            } else {
                props.setSelectedRowIds(union(pageIds, props.selectedRowIds));
            }
        }
    };

    const [dataWillChange, setDataWillChange] = React.useState<boolean>(true);
    React.useEffect(() => setDataWillChange(false), [props.data]);

    const backDisabled = dataWillChange || props.page === 0;
    const isLastPage =
        Math.floor(props.count / props.rowsPerPage) <= props.page;
    const nextDisabled =
        dataWillChange || props.data === undefined || isLastPage;

    return (
        <>
            <Table size="small">
                {props.headers && (
                    <TableHead>
                        <TableRow className={classes.row}>
                            {props.selectedRowIds !== undefined && (
                                <TableCell>
                                    {props.data && (
                                        <Tooltip
                                            title={`${
                                                allSelected ? "Des" : "S"
                                            }elect all rows on this page`}
                                        >
                                            <Checkbox
                                                data-testid="select all"
                                                className={classes.checkbox}
                                                size="small"
                                                onChange={() =>
                                                    toggleSelectAll()
                                                }
                                                checked={allSelected}
                                            />
                                        </Tooltip>
                                    )}
                                </TableCell>
                            )}
                            {props.headers.map(header => (
                                <TableCell key={header.key}>
                                    <Box>
                                        {props.onClickHeader ? (
                                            header.disableSort ? (
                                                header.label
                                            ) : (
                                                <TableSortLabel
                                                    active={header.active}
                                                    direction={header.direction}
                                                    onClick={() => {
                                                        if (
                                                            props.onClickHeader
                                                        ) {
                                                            setDataWillChange(
                                                                true
                                                            );
                                                            props.onClickHeader(
                                                                header
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {header.label}
                                                </TableSortLabel>
                                            )
                                        ) : (
                                            header.label
                                        )}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {props.data && props.data.length > 0 ? (
                        props.data.map(row => (
                            <TableRow
                                key={props.getRowKey(row)}
                                className={classes.row}
                                hover={!!props.onClickRow}
                                onClick={() =>
                                    props.onClickRow && props.onClickRow(row)
                                }
                            >
                                {props.selectedRowIds !== undefined && (
                                    <TableCell className={classes.checkboxCell}>
                                        <Checkbox
                                            data-testid={`select ${row.id}`}
                                            className={classes.checkbox}
                                            size="small"
                                            checked={selectedPageIds.includes(
                                                row.id
                                            )}
                                        />
                                    </TableCell>
                                )}
                                {props.renderRowContents
                                    ? props.renderRowContents(row)
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
                        ))
                    ) : props.data?.length === 0 ? (
                        <TableRow>
                            <TableCell>
                                <Typography
                                    noWrap
                                    style={{
                                        overflow: "visible",
                                        width: 0
                                    }}
                                    variant="subtitle2"
                                    color="textSecondary"
                                >
                                    No data found for these filters.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <RowsPlaceholder numCols={props.headers?.length} />
                    )}
                </TableBody>
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
                backIconButtonProps={{ disabled: backDisabled }}
                nextIconButtonProps={{ disabled: nextDisabled }}
            />
        </>
    );
}

export default PaginatedTable;
