import * as React from 'react';
import FileTable from "./FileTable";
import { File } from "../../model/File";
import mockFiles from "./mockFiles.json";
import { Grid, TextField } from '@material-ui/core';
import FileFilter from "./FileFilter";
import _ from 'lodash';
import autobind from 'autobind-decorator';
import "./BrowseFiles.css";
import { filterFiles, changeOption } from "./BrowseFilesUtil";

export interface IBrowseFilesPageState {
    files: File[];
    selectedTrialIds: string[];
    selectedExperimentalStrategies: string[];
    selectedDataFormats: string[];
    searchFilter: string;
}

export default class BrowseFilesPage extends React.Component<{}, IBrowseFilesPageState> {

    state = {
        files: [] as File[],
        selectedTrialIds: [] as string[],
        selectedExperimentalStrategies: [] as string[],
        selectedDataFormats: [] as string[],
        searchFilter: ""
    }

    componentDidMount() {
        this.setState({
            files: mockFiles
        });
    }

    @autobind
    private handleTrialIdChange(trialId: string) {
        this.setState({ selectedTrialIds: changeOption(this.state.selectedTrialIds, trialId) });
    }

    @autobind
    private handleExperimentalStrategyChange(experimentalStrategy: string) {
        this.setState({
            selectedExperimentalStrategies: changeOption(this.state.selectedExperimentalStrategies,
                experimentalStrategy)
        });
    }

    @autobind
    private handleDataFormatChange(dataFormat: string) {
        this.setState({ selectedDataFormats: changeOption(this.state.selectedDataFormats, dataFormat) });
    }

    @autobind
    private handleSearchFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ searchFilter: event.target.value });
    }

    public render() {
        return (
            <div className="Browse-files-page">
                <Grid container spacing={32}>
                    <Grid item xs={3}>
                        <FileFilter trialIds={_.uniq(_.map(this.state.files, "trialId"))}
                            experimentalStrategies={_.uniq(_.map(this.state.files, "experimentalStrategy"))}
                            dataFormats={_.uniq(_.map(this.state.files, "dataFormat"))}
                            onTrialIdChange={this.handleTrialIdChange}
                            onExperimentalStrategyChange={this.handleExperimentalStrategyChange}
                            onDataFormatChange={this.handleDataFormatChange} />
                    </Grid>
                    <Grid item xs={9}>
                        <div className="File-search-border">
                            <TextField label="Search by file name" type="search" margin="normal" variant="outlined"
                                value={this.state.searchFilter} className="File-search" InputProps={{
                                    className: "File-search-input",
                                }} InputLabelProps={{
                                    className: "File-search-label"
                                }} onChange={this.handleSearchFilterChange} />
                        </div>
                        <FileTable files={filterFiles(this.state.files, this.state.selectedTrialIds,
                            this.state.selectedExperimentalStrategies, this.state.selectedDataFormats, this.state.searchFilter)} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}
