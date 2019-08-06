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
import { File } from "../../model/file";
import { Trial } from "../../model/trial";

const NAME_KEY = "file_name";
const TRIAL_ID_KEY = "trial_name";
const EXPERIMENTAL_STRATEGY_KEY = "experimental_strategy";
const NUMBER_OF_CASES_KEY = "number_of_samples";
const DATA_FORMAT_KEY = "data_format";
const SIZE_KEY = "file_size";

export interface IFileTableProps {
    files: File[];
    trials: Trial[];
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
    private handleClick(fileId: string) {
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

    private handlePopoverOpen(event: any, isLocked: boolean) {
        if (isLocked) {
            this.setState({ anchorEl: event.target });
        }
    }

    private handlePopoverClose(isLocked: boolean) {
        if (isLocked) {
            this.setState({ anchorEl: null });
        }
    }

    public render() {
        return (
            <div className="File-table">
                <Table>
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
                                    Trial Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy ===
                                        EXPERIMENTAL_STRATEGY_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(
                                            EXPERIMENTAL_STRATEGY_KEY
                                        )
                                    }
                                >
                                    Experimental Strategy
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy ===
                                        NUMBER_OF_CASES_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(
                                            NUMBER_OF_CASES_KEY
                                        )
                                    }
                                >
                                    # of Samples
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="File-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy === DATA_FORMAT_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(
                                            DATA_FORMAT_KEY
                                        )
                                    }
                                >
                                    Data Format
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
                            .map((file: File) => {
                                const isLocked = this.props.trials.filter(
                                    trial =>
                                        file.trial_name === trial.trial_name
                                )[0].locked;
                                return (
                                    <TableRow
                                        key={file._id}
                                        hover={!isLocked}
                                        // tslint:disable-next-line:jsx-no-lambda
                                        onClick={() =>
                                            isLocked
                                                ? null
                                                : this.handleClick(file._id)
                                        }
                                        style={{
                                            backgroundColor: isLocked
                                                ? "#FFE8E6"
                                                : "inherit",
                                            cursor: isLocked
                                                ? "inherit"
                                                : "pointer"
                                        }}
                                        onMouseOver={event =>
                                            this.handlePopoverOpen(
                                                event,
                                                isLocked
                                            )
                                        }
                                        onMouseOut={() =>
                                            this.handlePopoverClose(isLocked)
                                        }
                                    >
                                        <TableCell className="File-table-row-cell">
                                            {file.file_name}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.trial_name}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.experimental_strategy}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.number_of_samples}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {file.data_format}
                                        </TableCell>
                                        <TableCell className="File-table-row-cell">
                                            {filesize(file.file_size)}
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
