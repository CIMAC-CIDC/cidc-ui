import React from "react";
import {
    makeStyles,
    Tooltip,
    Grid,
    IconButton,
    Button
} from "@material-ui/core";
import { useFormContext } from "react-hook-form";
// @ts-ignore
import ReactDataSheet, { Cell } from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";
import { withStyles } from "@material-ui/styles";
import { Delete } from "@material-ui/icons";

export const makeHeaderRow = (headers: string[]) =>
    headers.map(h => ({ readOnly: true, value: h, header: true }));

const useStyles = makeStyles({
    datasheet: {
        "& .value-viewer": { padding: ".5em !important" },
        "& .data-editor": {
            fontSize: "inherit !important",
            height: "calc(100% + 3px) !important",
            width: "calc(100% - 1rem) !important",
            padding: "calc(.5em - 2px) !important"
        },
        "& .cell:not(.read-only)": { minWidth: 200 }
    }
});

const attributesRenderer = (cell: IGridElement) => {
    const attrs: any = {};
    if (cell.header) {
        attrs.style = {
            color: "black",
            fontWeight: "bold"
        };
    }
    if (cell.error) {
        attrs.style = {
            background: "#ffe8e8"
        };
    }
    return attrs;
};

const ShiftedTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor: "#f50057",
        margin: -13
    }
}))(Tooltip);

const cellRenderer: ReactDataSheet.CellRenderer<
    IGridElement,
    CellValue
> = props => {
    const cell = <Cell {...props} />;

    return !!props.cell.error ? (
        <ShiftedTooltip open title={props.cell.error} style={{ margin: -13 }}>
            {cell}
        </ShiftedTooltip>
    ) : (
        cell
    );
};

type CellValue = number | string | null;

export interface IGridElement
    extends ReactDataSheet.Cell<IGridElement, CellValue> {
    header?: boolean;
    error?: string;
    locked?: string;
    value: CellValue;
}

export interface ICellWithLocation<T> {
    row: number;
    attr: keyof T;
    value: CellValue;
}

export interface IFormStepDataSheetProps<T> {
    grid: IGridElement[][];
    colToAttr: { [k: number]: keyof T };
    rootObjectName: string;
    setGrid: (g: IGridElement[][]) => void;
    getCellName: (cell: Omit<ICellWithLocation<T>, "value">) => string;
    getCellValidation: (cell: ICellWithLocation<T>) => (value: any) => any;
    processCellValue: (cell: ICellWithLocation<T>) => any;
    makeEmptyRow: () => IGridElement[];
}

function FormStepDataSheet<T>({
    grid,
    colToAttr,
    rootObjectName,
    setGrid,
    getCellName,
    getCellValidation,
    processCellValue,
    makeEmptyRow
}: IFormStepDataSheetProps<T>) {
    const styles = useStyles();
    const form = useFormContext();

    React.useEffect(() => {
        const rows = grid.slice(1);
        rows.forEach((cells, row) => {
            cells.forEach(({ value }, col) => {
                const attr = colToAttr[col];
                if (attr) {
                    const cell = { row, attr, value };
                    const name = getCellName(cell);
                    const validate = getCellValidation(cell);
                    const processedValue = processCellValue(cell);

                    form.register({ name }, { validate });
                    form.setValue(name, processedValue);
                    if (!!cell.value) {
                        form.triggerValidation(name);
                    }
                }
            });
        });
    }, [
        grid,
        colToAttr,
        form,
        getCellName,
        getCellValidation,
        processCellValue
    ]);

    const addRows = (num: number) => {
        const newRows = Array(num)
            .fill(null)
            .map(() => makeEmptyRow());
        setGrid([...grid, ...newRows]);
    };
    const removeRow = (row: number) => {
        // Unregister the bottom row
        Object.values(colToAttr).forEach(attr => {
            const name = getCellName({ attr, row: grid.length - 2 });
            form.unregister(name);
            form.triggerValidation(name);
        });
        const newGrid = [...grid.slice(0, row), ...grid.slice(row + 1)];
        setGrid(newGrid);
    };

    const rowRenderer: ReactDataSheet.RowRenderer<
        IGridElement,
        CellValue
    > = props => {
        return (
            <tr>
                {props.children}
                {props.row > 0 && (
                    <td>
                        <Tooltip title="Remove row">
                            <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => removeRow(props.row)}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </td>
                )}
            </tr>
        );
    };

    const errs = form.errors[rootObjectName];
    const processedGrid = grid.map((row: any, rowNumWithHeader: number) => {
        const rowNumCell = {
            readOnly: true,
            value: rowNumWithHeader === 0 ? "" : rowNumWithHeader
        };
        const rowNum = rowNumWithHeader - 1;
        row.forEach((cell: IGridElement, colNum: number) => {
            const attr = colToAttr[colNum];
            const error = errs && attr && errs[rowNum] && errs[rowNum][attr];
            if (error) {
                row[colNum].error = error.message;
            } else {
                row[colNum].error = undefined;
            }
        });
        return [rowNumCell, ...row];
    });

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <ReactDataSheet<IGridElement, CellValue>
                    className={styles.datasheet}
                    data={processedGrid}
                    cellRenderer={cellRenderer}
                    rowRenderer={rowRenderer}
                    attributesRenderer={attributesRenderer}
                    valueRenderer={cell => cell.value}
                    onCellsChanged={(changesWithRowNum, additions) => {
                        // Adjust for added row numbers by shifting each change's
                        // column left by 1 cell.
                        const changes = changesWithRowNum.map(c => ({
                            ...c,
                            col: c.col - 1
                        }));
                        const g = grid.map(row => [...row]);
                        changes.forEach(({ row, col, value }) => {
                            g[row][col] = {
                                ...grid[row][col],
                                value
                            };
                        });
                        if (makeEmptyRow) {
                            additions?.forEach(({ row, col, value }) => {
                                if (!g[row]) {
                                    g[row] = makeEmptyRow();
                                }
                                g[row][col] = { value };
                            });
                        }
                        setGrid(g);
                    }}
                />
            </Grid>
            <Grid item>
                <Button size="small" onClick={() => addRows(5)}>
                    Add 5 Rows
                </Button>
            </Grid>
        </Grid>
    );
}

export default FormStepDataSheet;
