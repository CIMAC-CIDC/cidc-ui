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
    const processKey = (key: string) => key.replace("assays.", "");
    const processValue = (value: any) => {
        if (value instanceof Array) {
            return value.join(", ");
        }
        return value.toString();
    };
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
                    {map(props.metadata, (value, key) => (
                        <TableRow key={key}>
                            <TableCell className="File-table-row-cell">
                                {processKey(key)}
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {processValue(value)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdditionalMetadataTable;
