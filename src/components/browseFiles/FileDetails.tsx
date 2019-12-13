import * as React from "react";
import map from "lodash/map";
import {
    Table,
    TableRow,
    TableCell,
    TableBody,
    Card,
    CardHeader,
    CardContent
} from "@material-ui/core";
import { DataFile } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";
import filesize from "filesize";

export interface IFileDetailsTableProps {
    title: string;
    values: Array<{ name: string; value: string }>;
}

const FileDetailsTable: React.FunctionComponent<
    IFileDetailsTableProps
> = props => {
    return (
        <Card>
            <CardHeader title={props.title} />
            <CardContent style={{ padding: 0 }}>
                <Table size="small">
                    <TableBody>
                        {props.values.map(({ name, value }) => (
                            <TableRow key={name}>
                                <TableCell>
                                    <strong>{name}</strong>
                                </TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export const AdditionalMetadataTable: React.FunctionComponent<{
    file: DataFile;
}> = ({ file }) => {
    const metadata = file.additional_metadata;

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
    const rows = map(metadata, (value, key) => ({
        name: processKey(key),
        value: processValue(value)
    })).sort((a, b) => countDots(a.name) - countDots(b.name));

    return <FileDetailsTable title="Additional Metadata" values={rows} />;
};

export const CoreDetailsTable: React.FunctionComponent<{
    file: DataFile;
}> = props => {
    const value = (name: string, v: string) => ({ name, value: v });

    return (
        <FileDetailsTable
            title="Core File Details"
            values={[
                value("File Name", props.file.object_url),
                value("Protocol Identifier", props.file.trial),
                value("Type", props.file.assay_type),
                value("Format", props.file.data_format),
                value("File Size", filesize(props.file.file_size_bytes)),
                value(
                    "Date/Time Uploaded",
                    new Date(props.file.uploaded_timestamp).toLocaleString(
                        LOCALE,
                        DATE_OPTIONS
                    )
                )
            ]}
        />
    );
};
