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
import Alert from "../../generic/Alert";

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
        "& .cell:not(.read-only)": { width: 175 }
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
        margin: -13,
        maxWidth: 170
    }
}))(Tooltip);

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
    addRowsButtonText?: string;
    addRowsIncrement?: number;
    preRowComponent?: React.FC<
        ReactDataSheet.RowRendererProps<IGridElement, CellValue>
    >;
    setGrid: (g: IGridElement[][]) => void;
    getCellName: (cell: Omit<ICellWithLocation<T>, "value">) => string;
    processCellValue: (cell: ICellWithLocation<T>) => any;
    getCellValidation?: (cell: ICellWithLocation<T>) => (value: any) => any;
    makeEmptyRow?: () => IGridElement[];
    getDependentRows?: (row: number) => number[];
}

function FormStepDataSheet<T>({
    grid,
    colToAttr,
    rootObjectName,
    preRowComponent,
    addRowsIncrement,
    addRowsButtonText,
    setGrid,
    getCellName,
    getCellValidation,
    processCellValue,
    makeEmptyRow,
    getDependentRows
}: IFormStepDataSheetProps<T>) {
    const styles = useStyles();
    const form = useFormContext();
    const errs = form.errors[rootObjectName];

    const addRows = (num: number) => {
        if (makeEmptyRow) {
            const newRows = Array(num)
                .fill(null)
                .map(() => makeEmptyRow());
            setGrid([...grid, ...newRows]);
        }
    };
    const handleDelete = (row: number) => {
        const removeRow = (g: IGridElement[][], rowToDelete: number) => {
            // Unregister the bottom row
            Object.values(colToAttr).forEach(attr => {
                const name = getCellName({ attr, row: g.length - 2 });
                form.unregister(name);
                form.triggerValidation(name);
            });
            return [...g.slice(0, row), ...g.slice(row + 1)];
        };
        const rows = getDependentRows ? [row, ...getDependentRows(row)] : [row];
        const newGrid = rows.reduce((g, r) => removeRow(g, r), grid);
        setGrid(newGrid);
    };

    const CellRenderer: ReactDataSheet.CellRenderer<
        IGridElement,
        CellValue
    > = props => {
        const {
            row,
            col,
            cell: { forceComponent, value }
        } = props;
        const attr = colToAttr[col];
        const cellWithLoc = { row: row - 1, attr, value };
        const name = getCellName(cellWithLoc);
        const validate = getCellValidation
            ? getCellValidation(cellWithLoc)
            : undefined;
        const processedValue = processCellValue(cellWithLoc);

        const storedValue = form.getValues()[name] || "";

        React.useEffect(() => {
            if (row > 0 && !storedValue && !forceComponent) {
                form.register({ name }, { validate });
            }
            // eslint-disable-next-line
        }, []);

        React.useEffect(() => {
            if (row > 0 && storedValue !== processedValue && !forceComponent) {
                form.setValue(name, processedValue);
                if (!!storedValue || !!processedValue) {
                    form.triggerValidation(name);
                }
            }
            // eslint-disable-next-line
        }, [storedValue, processedValue]);

        const cell = <Cell {...props} />;

        return !!props.cell.error ? (
            <ShiftedTooltip
                open
                title={props.cell.error}
                style={{ margin: -13 }}
            >
                {cell}
            </ShiftedTooltip>
        ) : (
            cell
        );
    };

    const RowRenderer: React.FC<ReactDataSheet.RowRendererProps<
        IGridElement,
        CellValue
    >> = props => {
        const [alertOpen, setAlertOpen] = React.useState<boolean>(false);

        return (
            <tr>
                {preRowComponent && preRowComponent(props)}
                {props.children}
                {props.row > 0 && (
                    <td>
                        <Tooltip title="Remove row">
                            <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => setAlertOpen(true)}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Alert
                            open={alertOpen}
                            title="Are you sure you want to delete this row?"
                            description="This will invalidate any other data that depends on this row."
                            onAccept={() => handleDelete(props.row)}
                            onCancel={() => setAlertOpen(false)}
                        />
                    </td>
                )}
            </tr>
        );
    };

    const processedGrid = grid.map((row: any, rowNumWithHeader: number) => {
        const rowNum = rowNumWithHeader - 1;
        row.forEach((cell: IGridElement, colNum: number) => {
            if (cell.readOnly) {
                return;
            }
            const attr = colToAttr[colNum];
            const error = errs && attr && errs[rowNum] && errs[rowNum][attr];
            if (error) {
                row[colNum].error = error.message;
            } else {
                row[colNum].error = undefined;
            }
        });
        return row;
    });

    const handleCellsChanged: ReactDataSheet.CellsChangedHandler<
        IGridElement,
        CellValue
    > = (changes, additions) => {
        changes.forEach(({ row, col, value }) => {
            grid[row][col] = {
                ...grid[row][col],
                value
            };
        });

        // If additional data beyond the current bounds of the spreadsheet
        // was pasted, created and fill new cells with that data.
        additions?.forEach(({ row, col, value }) => {
            if (!grid[row] && makeEmptyRow) {
                grid[row] = makeEmptyRow();
            }
            // Only allow in-bounds columns
            if (col < grid[0].length && grid[row]) {
                grid[row][col] = { value };
            }
        });

        setGrid(grid);
    };

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <ReactDataSheet<IGridElement, CellValue>
                    className={styles.datasheet}
                    data={processedGrid}
                    cellRenderer={CellRenderer}
                    rowRenderer={RowRenderer}
                    attributesRenderer={attributesRenderer}
                    valueRenderer={cell => cell.value}
                    onCellsChanged={handleCellsChanged}
                />
            </Grid>
            <Grid item>
                {makeEmptyRow && (
                    <Button
                        size="small"
                        onClick={() => addRows(addRowsIncrement || 5)}
                    >
                        {addRowsButtonText || "Add 5 Rows"}
                    </Button>
                )}
            </Grid>
        </Grid>
    );
}

export default FormStepDataSheet;
