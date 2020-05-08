import React from "react";
import { makeStyles } from "@material-ui/core";
import { useFormContext } from "react-hook-form";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

export const makeEmptyRow = (row: number, width: number) => {
    const values = Array(width).fill({ value: "" });
    return [{ readOnly: true, value: row }, ...values];
};

export const makeHeaderRow = (...headers: string[]) => [
    { readOnly: true, value: "" },
    ...headers.map(h => ({ readOnly: true, value: h, header: true }))
];

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
    return attrs;
};

type CellValue = number | string | null;

export interface IGridElement
    extends ReactDataSheet.Cell<IGridElement, CellValue> {
    header?: boolean;
    value: CellValue;
}

interface IFormStepDataSheetProps {
    grid: IGridElement[][];
    setGrid: (g: IGridElement[][]) => void;
    getCellName: (
        cell: ReactDataSheet.DataEditorProps<IGridElement, CellValue>
    ) => string;
    processCellValue: (
        value: string,
        cell: ReactDataSheet.DataEditorProps<IGridElement, CellValue>
    ) => any;
}

const FormStepDataSheet: React.FC<IFormStepDataSheetProps> = ({
    grid,
    setGrid,
    getCellName,
    processCellValue
}) => {
    const styles = useStyles();

    const DataEditor: React.FC<ReactDataSheet.DataEditorProps<
        IGridElement,
        CellValue
    >> = props => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const { register, setValue } = useFormContext();
        const name = getCellName(props);

        React.useEffect(() => {
            register({ name });
            inputRef?.current?.focus();
        }, [name, register]);

        return (
            <input
                className="data-editor"
                ref={inputRef}
                value={props.value || ""}
                onChange={e => {
                    const newValue = e.target.value;
                    props.onChange(newValue);
                    setValue(name, processCellValue(newValue, props));
                }}
                onKeyDown={props.onKeyDown}
            />
        );
    };

    return (
        <ReactDataSheet<IGridElement, CellValue>
            className={styles.datasheet}
            data={grid}
            dataEditor={DataEditor}
            attributesRenderer={attributesRenderer}
            valueRenderer={cell => cell.value}
            onCellsChanged={changes => {
                const g = grid.map(row => [...row]);
                changes.forEach(({ row, col, value }) => {
                    g[row][col] = {
                        ...grid[row][col],
                        value
                    };
                });
                setGrid(g);
            }}
        />
    );
};

export default FormStepDataSheet;
