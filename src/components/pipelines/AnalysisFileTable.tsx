import * as React from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@material-ui/core";
import { Link } from "react-router-dom";

export default class AnalysisFileTable extends React.Component<any, {}> {
    public render() {
        return (
            <div className="Analysis-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className="Analysis-table-header-cell">
                                File Name
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                Data Format
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.files.map((file: any) => {
                            return (
                                <TableRow key={file.data_id}>
                                    <TableCell className="Analysis-table-row-cell">
                                        <Link
                                            to={"/file-details/" + file.data_id}
                                        >
                                            {file.file_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="Analysis-table-row-cell">
                                        {file.file_type}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}
