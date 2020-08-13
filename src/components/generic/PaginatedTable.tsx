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
    Box
} from "@material-ui/core";

const useStyles = makeStyles({
    message: {
        margin: "1rem"
    },
    row: {
        cursor: "auto !important"
    }
});

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
    renderRowContents?: (row: DataRow) => React.ReactElement;
}

export interface IHeader {
    key: string;
    label: string;
    format?: (v: any) => string | React.ReactElement;
    active?: boolean;
    direction?: "asc" | "desc";
    disableSort?: boolean;
}

// TODO (maybe): refine this type
export type DataRow = any;

const PaginatedTable: React.FC<IPaginatedTableProps> = props => {
    const classes = useStyles();

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
                            {props.headers.map(header => (
                                <TableCell key={header.key}>
                                    <Box whiteSpace="nowrap">
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
                    ) : (
                        <TableRow>
                            <TableCell>
                                <Typography
                                    className={classes.message}
                                    color="textSecondary"
                                >
                                    {props.data === undefined
                                        ? "Loading..."
                                        : "No data found for these filters."}
                                </Typography>
                            </TableCell>
                        </TableRow>
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
};

export default PaginatedTable;
