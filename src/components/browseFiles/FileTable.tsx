import {
    TablePagination,
    TableSortLabel,
    Popover,
    Typography
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import autobind from "autobind-decorator";
import filesize from "filesize";
import _ from "lodash";
import * as React from "react";
import { DataFile } from "../../model/file";

const NAME_KEY = "object_url";
const TRIAL_ID_KEY = "trial_id";
const ASSAY_TYPE_KEY = "assay_type";
const FILE_TYPE_KEY = "data_format";
const SIZE_KEY = "file_size_bytes";

export interface IFileTableProps {
    files: DataFile[];
    trials: string[];
    history: any;
}

export interface IFileTableState {
    rowsPerPage: number;
    page: number;
    sortBy: string;
    sortDirection: "asc" | "desc";
    anchorEl: any;
}

export default class FileTable extends React.Component<
    IFileTableProps,
    IFileTableState
> {
    state: IFileTableState = {
        page: 0,
        rowsPerPage: 10,
        sortBy: NAME_KEY,
        sortDirection: "asc",
        anchorEl: null
    };

    @autobind
    private handleChangePage(
        event: React.MouseEvent<HTMLButtonElement> | null,
        page: number
    ) {
        this.setState({ page });
    }

    @autobind
    private handleClick(fileId: number) {
        this.props.history.push("/file-details/" + fileId);
    }

    @autobind
    private handleChangeRowsPerPage(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ rowsPerPage: Number(event.target.value) });
    }

    private handleChangeSorting(sortBy: string) {
        const isAsc =
            this.state.sortBy === sortBy && this.state.sortDirection === "asc";
        this.setState({ sortBy, sortDirection: isAsc ? "desc" : "asc" });
    }

    public render() {
        return (
            <div>
                <Table className="File-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === NAME_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(NAME_KEY)
                                    }
                                >
                                    File Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === TRIAL_ID_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(TRIAL_ID_KEY)
                                    }
                                >
                                    Protocol Identifier
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy === ASSAY_TYPE_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(ASSAY_TYPE_KEY)
                                    }
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === FILE_TYPE_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(FILE_TYPE_KEY)
                                    }
                                >
                                    Format
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === SIZE_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(SIZE_KEY)
                                    }
                                >
                                    File Size
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_.orderBy(
                            this.props.files,
                            this.state.sortBy,
                            this.state.sortDirection
                        )
                            .slice(
                                this.state.page * this.state.rowsPerPage,
                                this.state.page * this.state.rowsPerPage +
                                    this.state.rowsPerPage
                            )
                            .map((file: DataFile) => {
                                // NOTE: remove the concept of "locked" trials for now,
                                // but evaluate adding it back as necessary.
                                return (
                                    <TableRow
                                        className="File-table-row"
                                        key={file.id}
                                        hover={true}
                                        // tslint:disable-next-line:jsx-no-lambda
                                        onClick={() =>
                                            this.handleClick(file.id)
                                        }
                                    >
                                        <TableCell className="File-table-row-cell filename">
                                            {file.object_url}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.trial}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.assay_type}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.data_format}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {filesize(file.file_size_bytes)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    rowsPerPageOptions={[5, 10, 25]}
                    count={this.props.files.length}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
                <Popover
                    style={{ pointerEvents: "none" }}
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                >
                    <Typography style={{ margin: 5 }}>
                        This trial is currently locked
                    </Typography>
                </Popover>
            </div>
        );
    }
}
