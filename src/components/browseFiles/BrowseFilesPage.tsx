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
import { withIdToken } from "../../identity/AuthProvider";
import { RouteComponentProps } from "react-router";

export interface IBrowseFilesPageState {
    files: DataFile[] | undefined;
    trials: string[] | undefined;
}

class BrowseFilesPage extends React.Component<
    RouteComponentProps & { token: string },
    IBrowseFilesPageState
> {
    state: IBrowseFilesPageState = {
        files: undefined,
        trials: undefined
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
    private handleArrayParamChange(
        params: URLSearchParams,
        values: string[],
        paramKey: "protocol_id" | "type" | "data_format",
        value: string
    ) {
        const newValues = changeOption(values, value);

        // Clear all old values for this param then set new values
        params.delete(paramKey);
        for (const val of newValues) {
            params.append(paramKey, val);
        }

        // Apply search string updates to the current location
        this.props.history.push({
            ...this.props.location,
            search: params.toString()
        });
    }

    @autobind
    private handleSearchFilterChange(
        event: React.ChangeEvent<HTMLInputElement>,
        params: URLSearchParams
    ) {
        params.set("search", event.target.value);
        this.props.history.push({
            ...this.props.location,
            search: params.toString()
        });
    }

    public render() {
        // Extract current filter parameters from the URL
        const params = new URLSearchParams(this.props.location.search);
        const searchFilter = params.get("search") || "";
        const selectedTrialIds = params.getAll("protocol_id");
        const selectedDataFormats = params.getAll("data_format");
        const selectedTypes = params.getAll("type");

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
                    <Grid container={true} spacing={3}>
                        <Grid item={true} xs={3}>
                            <FileFilter
                                trialIds={{
                                    options: _.uniq(
                                        _.map(this.state.files, "trial")
                                    ),
                                    checked: selectedTrialIds
                                }}
                                experimentalStrategies={{
                                    options: _.uniq(
                                        _.map(this.state.files, "assay_type")
                                    ),
                                    checked: selectedTypes
                                }}
                                dataFormats={{
                                    options: _.uniq(
                                        _.map(this.state.files, "data_format")
                                    ),
                                    checked: selectedDataFormats
                                }}
                                onTrialIdChange={tid =>
                                    this.handleArrayParamChange(
                                        params,
                                        selectedTrialIds,
                                        "protocol_id",
                                        tid
                                    )
                                }
                                onExperimentalStrategyChange={typ =>
                                    this.handleArrayParamChange(
                                        params,
                                        selectedTypes,
                                        "type",
                                        typ
                                    )
                                }
                                onDataFormatChange={dataFormat =>
                                    this.handleArrayParamChange(
                                        params,
                                        selectedDataFormats,
                                        "data_format",
                                        dataFormat
                                    )
                                }
                            />
                        </Grid>
                        <Grid item={true} xs={9}>
                            <div className="File-search-border">
                                <TextField
                                    label="Search"
                                    type="search"
                                    margin="normal"
                                    variant="outlined"
                                    value={searchFilter}
                                    className="File-search"
                                    InputProps={{
                                        className: "File-search-input"
                                    }}
                                    InputLabelProps={{
                                        className: "File-search-label"
                                    }}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        this.handleSearchFilterChange(e, params)
                                    }
                                />
                            </div>
                            <FileTable
                                history={this.props.history}
                                files={filterFiles(
                                    this.state.files,
                                    selectedTrialIds,
                                    selectedTypes,
                                    selectedDataFormats,
                                    searchFilter
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

export default withIdToken(BrowseFilesPage);
