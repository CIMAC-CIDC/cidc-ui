import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import * as React from "react";
import { FastqProperties } from "../../model/fastqProperties";

export interface IFileFastqDetailsTableProps {
    fastqProperties: FastqProperties;
}

export default class FastqDetailsTable extends React.Component<
    IFileFastqDetailsTableProps,
    {}
> {
    public render() {
        return (
            <div className="File-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Attribute Name</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>CIMAC Patient ID</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.patient_id}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>CIMAC Sample ID</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.sample_id}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Sample Type</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.sample_type}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Pair Label</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.pair_label}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Time Point</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.timepoint}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Time Point Unit</TableCell>
                            <TableCell>
                                {this.props.fastqProperties.timepoint_unit}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}
