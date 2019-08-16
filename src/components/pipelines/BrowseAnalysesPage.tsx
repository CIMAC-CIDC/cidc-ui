import { Grid, CircularProgress, Typography } from "@material-ui/core";
import autobind from "autobind-decorator";
import _ from "lodash";
import * as React from "react";
import "./BrowseAnalyses.css";
import { changeOption, filterAnalyses } from "./BrowseAnalysesUtil";
import { getAnalyses, getTrials } from "../../api/api";
import { Analysis } from "../../model/analysis";
import AnalysisTable from "./AnalysisTable";
import AnalysisFilter from "./AnalysisFilter";
import { Trial } from "../../model/trial";

export interface IBrowseAnalysesPageState {
    analyses: Analysis[] | undefined;
    trials: Trial[] | undefined;
    selectedTrialIds: string[];
    selectedExperimentalStrategies: string[];
    selectedStatuses: string[];
}

export default class BrowseAnalysesPage extends React.Component<
    any,
    IBrowseAnalysesPageState
> {
    state: IBrowseAnalysesPageState = {
        analyses: undefined,
        trials: undefined,
        selectedTrialIds: [],
        selectedExperimentalStrategies: [],
        selectedStatuses: []
    };

    componentDidMount() {
        if (this.props.token) {
            this.getAnalyses();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.token !== prevProps.token) {
            this.getAnalyses();
        }
    }

    @autobind
    private getAnalyses() {
        getAnalyses(this.props.token).then(results => {
            getTrials(this.props.token).then(result => {
                this.setState({ analyses: results, trials: result });
            });
        });
    }

    @autobind
    private handleTrialIdChange(trialId: string) {
        this.setState({
            selectedTrialIds: changeOption(this.state.selectedTrialIds, trialId)
        });
    }

    @autobind
    private handleExperimentalStrategyChange(experimentalStrategy: string) {
        this.setState({
            selectedExperimentalStrategies: changeOption(
                this.state.selectedExperimentalStrategies,
                experimentalStrategy
            )
        });
    }

    @autobind
    private handleStatusChange(status: string) {
        this.setState({
            selectedStatuses: changeOption(this.state.selectedStatuses, status)
        });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div className="Browse-analyses-page">
                {!this.state.analyses && (
                    <div className="Browse-analyses-progress">
                        <CircularProgress />
                    </div>
                )}
                {this.state.analyses && this.state.analyses.length === 0 && (
                    <div className="Browse-analyses-progress">
                        <Typography style={{ fontSize: 18 }}>
                            No analyses found
                        </Typography>
                    </div>
                )}
                {this.state.analyses && this.state.analyses.length > 0 && (
                    <Grid container={true} spacing={32}>
                        <Grid item={true} xs={2}>
                            <AnalysisFilter
                                trialIds={_.uniq(
                                    _.map(this.state.analyses, "trial_id")
                                )}
                                experimentalStrategies={_.uniq(
                                    _.map(this.state.analyses, "assay_category")
                                )}
                                statuses={_.uniq(
                                    _.map(this.state.analyses, "status")
                                )}
                                onTrialIdChange={this.handleTrialIdChange}
                                onExperimentalStrategyChange={
                                    this.handleExperimentalStrategyChange
                                }
                                onStatusChange={this.handleStatusChange}
                            />
                        </Grid>
                        <Grid item={true} xs={10}>
                            <AnalysisTable
                                history={this.props.history}
                                analyses={filterAnalyses(
                                    this.state.analyses,
                                    this.state.selectedTrialIds,
                                    this.state.selectedExperimentalStrategies,
                                    this.state.selectedStatuses
                                )}
                                trials={this.state.trials!}
                            />
                        </Grid>
                    </Grid>
                )}
            </div>
        );
    }
}
