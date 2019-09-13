import { Grid, TextField, Typography } from "@material-ui/core";
import autobind from "autobind-decorator";
import _ from "lodash";
import * as React from "react";
import { DataFile } from "../../model/file";
import "./BrowseFiles.css";
import { changeOption, filterFiles } from "./browseFilesUtil";
import FileFilter from "./FileFilter";
import FileTable from "./FileTable";
import { getFiles } from "../../api/api";
import Loader from "../generic/Loader";

export interface IBrowseFilesPageState {
    files: DataFile[] | undefined;
    trials: string[] | undefined;
    selectedTrialIds: string[];
    selectedExperimentalStrategies: string[];
    selectedDataFormats: string[];
    searchFilter: string;
}

export default class BrowseFilesPage extends React.Component<
    any,
    IBrowseFilesPageState
> {
    state: IBrowseFilesPageState = {
        files: undefined,
        trials: undefined,
        searchFilter: "",
        selectedDataFormats: [],
        selectedExperimentalStrategies: [],
        selectedTrialIds: []
    };

    componentDidMount() {
        if (this.props.token) {
            this.getFiles();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.token !== prevProps.token) {
            this.getFiles();
        }
    }

    @autobind
    private getFiles() {
        getFiles(this.props.token).then(files => {
            const trials = _.uniq(files.map(file => file.trial));
            this.setState({ files, trials });
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
    private handleDataFormatChange(dataFormat: string) {
        this.setState({
            selectedDataFormats: changeOption(
                this.state.selectedDataFormats,
                dataFormat
            )
        });
    }

    @autobind
    private handleSearchFilterChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ searchFilter: event.target.value });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div className="Browse-files-page">
                {!this.state.files && <Loader />}
                {this.state.files && this.state.files.length === 0 && (
                    <div className="Browse-files-progress">
                        <Typography style={{ fontSize: 18 }}>
                            No files found
                        </Typography>
                    </div>
                )}
                {this.state.files && this.state.files.length > 0 && (
                    <Grid container={true} spacing={32}>
                        <Grid item={true} xs={3}>
                            <FileFilter
                                trialIds={_.uniq(
                                    _.map(this.state.files, "trial")
                                )}
                                experimentalStrategies={_.uniq(
                                    _.map(this.state.files, "assay_type")
                                )}
                                dataFormats={_.uniq(
                                    _.map(this.state.files, "data_format")
                                )}
                                onTrialIdChange={this.handleTrialIdChange}
                                onExperimentalStrategyChange={
                                    this.handleExperimentalStrategyChange
                                }
                                onDataFormatChange={this.handleDataFormatChange}
                            />
                        </Grid>
                        <Grid item={true} xs={9}>
                            <div className="File-search-border">
                                <TextField
                                    label="Search by file name"
                                    type="search"
                                    margin="normal"
                                    variant="outlined"
                                    value={this.state.searchFilter}
                                    className="File-search"
                                    InputProps={{
                                        className: "File-search-input"
                                    }}
                                    InputLabelProps={{
                                        className: "File-search-label"
                                    }}
                                    onChange={this.handleSearchFilterChange}
                                />
                            </div>
                            <FileTable
                                history={this.props.history}
                                files={filterFiles(
                                    this.state.files,
                                    this.state.selectedTrialIds,
                                    this.state.selectedExperimentalStrategies,
                                    this.state.selectedDataFormats,
                                    this.state.searchFilter
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
