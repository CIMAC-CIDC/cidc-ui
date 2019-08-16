import * as React from "react";
import autobind from "autobind-decorator";
import { getSingleAnalysis } from "../../api/api";
import {
    Typography,
    CircularProgress,
    Grid,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField
} from "@material-ui/core";
import { Analysis } from "../../model/analysis";
import AnalysisFileTable from "./AnalysisFileTable";
import {
    LOCALE,
    DATE_OPTIONS,
    EXPERIMENTAL_STRATEGY_MAP
} from "../../util/constants";
import { Link } from "react-router-dom";

export interface IAnalysisDetailsPageState {
    analysis: Analysis | undefined;
}

export default class AnalysisDetailsPage extends React.Component<
    any,
    IAnalysisDetailsPageState
> {
    state: IAnalysisDetailsPageState = {
        analysis: undefined
    };

    componentDidMount() {
        if (this.props.token) {
            this.getAnalysis();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.token !== prevProps.token) {
            this.getAnalysis();
        }
    }

    @autobind
    private getAnalysis() {
        getSingleAnalysis(
            this.props.token,
            this.props.match.params.analysisId
        ).then(result => {
            this.setState({ analysis: result });
        });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div className="Browse-analyses-page">
                {!this.state.analysis && (
                    <div className="Browse-analyses-progress">
                        <CircularProgress />
                    </div>
                )}
                {this.state.analysis && (
                    <>
                        <Grid container={true} spacing={40}>
                            <Grid item={true} xs={4}>
                                <Typography variant="h5" gutterBottom={true}>
                                    Pipeline Details:
                                </Typography>
                                <div className="Analysis-table">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="Analysis-table-header-cell">
                                                    Attribute Name
                                                </TableCell>
                                                <TableCell className="Analysis-table-header-cell">
                                                    Value
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Pipeline ID
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    {this.state.analysis._id}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Trial Name
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    {
                                                        this.state.analysis
                                                            .trial_id
                                                    }
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Experimental Strategy
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    <Link
                                                        to={
                                                            EXPERIMENTAL_STRATEGY_MAP[
                                                                this.state
                                                                    .analysis
                                                                    .assay_category
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            this.state.analysis
                                                                .assay_category
                                                        }
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Time Started
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    {new Date(
                                                        this.state.analysis.start_date
                                                    ).toLocaleString(
                                                        LOCALE,
                                                        DATE_OPTIONS
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Time Completed
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    {this.state.analysis
                                                        .end_date
                                                        ? new Date(
                                                              this.state.analysis.end_date
                                                          ).toLocaleString(
                                                              LOCALE,
                                                              DATE_OPTIONS
                                                          )
                                                        : ""}
                                                </TableCell>
                                            </TableRow>

                                            <TableRow>
                                                <TableCell className="Analysis-table-row-cell">
                                                    Status
                                                </TableCell>
                                                <TableCell className="Analysis-table-row-cell">
                                                    {this.state.analysis.status}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </Grid>
                            <Grid item={true} xs={4}>
                                {this.state.analysis.files_used && (
                                    <>
                                        <Typography
                                            variant="h5"
                                            gutterBottom={true}
                                        >
                                            Pipeline Inputs:
                                        </Typography>
                                        <AnalysisFileTable
                                            files={
                                                this.state.analysis.files_used
                                            }
                                        />
                                    </>
                                )}
                            </Grid>
                            <Grid item={true} xs={4}>
                                {this.state.analysis.files_generated && (
                                    <>
                                        <Typography
                                            variant="h5"
                                            gutterBottom={true}
                                        >
                                            Pipeline Outputs:
                                        </Typography>
                                        <AnalysisFileTable
                                            files={
                                                this.state.analysis
                                                    .files_generated
                                            }
                                        />
                                    </>
                                )}
                            </Grid>
                        </Grid>
                        {this.state.analysis.error_message && (
                            <div style={{ paddingTop: 25 }}>
                                <Typography variant="h5" gutterBottom={true}>
                                    Error Message:
                                </Typography>
                                <TextField
                                    defaultValue={
                                        this.state.analysis.error_message
                                    }
                                    multiline={true}
                                    fullWidth={true}
                                    disabled={true}
                                    variant="outlined"
                                    style={{ backgroundColor: "#ECF7EE" }}
                                />
                            </div>
                        )}
                        {this.state.analysis.snakemake_log_tails && (
                            <div style={{ paddingTop: 25 }}>
                                <Typography variant="h5" gutterBottom={true}>
                                    Pipeline Console Log (last 50 lines):
                                </Typography>
                                <TextField
                                    defaultValue={this.state.analysis.snakemake_log_tails.join(
                                        "\n"
                                    )}
                                    multiline={true}
                                    fullWidth={true}
                                    disabled={true}
                                    variant="outlined"
                                    style={{ backgroundColor: "#ECF7EE" }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
}
