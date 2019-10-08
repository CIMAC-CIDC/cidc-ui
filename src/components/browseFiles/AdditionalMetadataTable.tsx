import * as React from "react";
import map from "lodash/map";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@material-ui/core";

export interface IFileDetailsTableProps {
    metadata: { [prop: string]: any };
}

const AdditionalMetadataTable: React.FunctionComponent<
    IFileDetailsTableProps
> = props => {
    // Presentational formatting
    const processKey = (key: string) => key.replace("assays.", "");
    const processValue = (value: any) => {
        if (value instanceof Array) {
            return value.join(", ");
        }
        return value.toString();
    };

    // For checking how nested in the data model a metadata key is
    const countDots = (s: string) => (s.match(/\./g) || []).length;

    // Format the metadata
    const rows = map(props.metadata, (value, key) => ({
        key: processKey(key),
        value: processValue(value)
    })).sort((a, b) => countDots(a.key) - countDots(b.key));

    return (
        <div className="File-table">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className="File-table-header-cell">
                            Attribute Name
                        </TableCell>
                        <TableCell className="File-table-header-cell">
                            Value
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(({ key, value }) => (
                        <TableRow key={key}>
                            <TableCell className="File-table-row-cell">
                                {key}
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {value}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdditionalMetadataTable;
