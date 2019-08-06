import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import filesize from "filesize";
import * as React from "react";
import { File } from "../../model/file";
import { LOCALE, DATE_OPTIONS } from "../../util/constants";

export interface IFileDetailsTableProps {
    file: File;
}

export default class FileDetailsTable extends React.Component<
    IFileDetailsTableProps,
    {}
> {
    public render() {
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
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                File Name
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file.file_name}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                File ID
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file._id}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                Trial Name
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file.trial_name}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                Experimental Strategy
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file.experimental_strategy}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                Number of Samples
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file.number_of_samples}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                Data Format
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {this.props.file.data_format}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                File Size
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {filesize(this.props.file.file_size)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="File-table-row-cell">
                                Data Upload Timestamp
                            </TableCell>
                            <TableCell className="File-table-row-cell">
                                {new Date(
                                    this.props.file.date_created
                                ).toLocaleString(LOCALE, DATE_OPTIONS)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}
