import { Grid, TextField, Typography, Button } from "@material-ui/core";
import autobind from "autobind-decorator";
import _ from "lodash";
import * as React from "react";
import "./BrowseFiles.css";
import { changeOption, filterFiles } from "./browseFilesUtil";
import FileFilter from "./FileFilter";
import FileTable from "./FileTable";
import { withIdToken } from "../identity/AuthProvider";
import { RouteComponentProps } from "react-router";
import { withData, IDataContext } from "../data/DataProvider";
import { Refresh } from "@material-ui/icons";
import Loader from "../generic/Loader";

class BrowseFilesPage extends React.Component<
    RouteComponentProps & { token: string } & IDataContext
> {
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

        const trials = _.uniq(this.props.files.map(f => f.trial));

        return (
            <div className="Browse-files-page">
                {this.props.files.length === 0 && (
                    <div className="Browse-files-progress">
                        <Typography style={{ fontSize: 18 }}>
                            No files found.
                        </Typography>
                    </div>
                )}
                {this.props.files.length > 0 && (
                    <Grid container={true} spacing={3}>
                        <Grid item={true} xs={3}>
                            <FileFilter
                                trialIds={{
                                    options: _.uniq(
                                        _.map(this.props.files, "trial")
                                    ),
                                    checked: selectedTrialIds
                                }}
                                experimentalStrategies={{
                                    options: _.uniq(
                                        _.map(this.props.files, "assay_type")
                                    ),
                                    checked: selectedTypes
                                }}
                                dataFormats={{
                                    options: _.uniq(
                                        _.map(this.props.files, "data_format")
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
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                            >
                                <Grid item>
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
                                                e: React.ChangeEvent<
                                                    HTMLInputElement
                                                >
                                            ) =>
                                                this.handleSearchFilterChange(
                                                    e,
                                                    params
                                                )
                                            }
                                        />
                                    </div>
                                </Grid>
                                <Grid item>
                                    <Button
                                        endIcon={<Refresh />}
                                        disabled={
                                            this.props.dataStatus === "fetching"
                                        }
                                        onClick={() => this.props.refreshData()}
                                    >
                                        Refresh
                                    </Button>
                                </Grid>
                            </Grid>
                            {this.props.dataStatus === "fetching" && <Loader />}
                            {this.props.dataStatus === "fetched" && (
                                <FileTable
                                    history={this.props.history}
                                    files={filterFiles(
                                        this.props.files,
                                        selectedTrialIds,
                                        selectedTypes,
                                        selectedDataFormats,
                                        searchFilter
                                    )}
                                    trials={trials}
                                />
                            )}
                            {this.props.dataStatus === "failed" && (
                                <Typography>
                                    Encountered an error fetching file data.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                )}
            </div>
        );
    }
}

export default withData(withIdToken(BrowseFilesPage));
