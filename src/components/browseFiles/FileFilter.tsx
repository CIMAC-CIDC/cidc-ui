import { Grid } from "@material-ui/core";
import * as React from "react";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";

export interface IFileFilterProps {
    trialIds: string[];
    experimentalStrategies: string[];
    dataFormats: string[];
    onTrialIdChange: (trialId: string) => void;
    onExperimentalStrategyChange: (experimentalStrategy: string) => void;
    onDataFormatChange: (dataFormat: string) => void;
}

export default class FileFilter extends React.Component<IFileFilterProps, {}> {
    public render() {
        return (
            <div className="File-filter">
                <Grid container={true}>
                    <Grid item={true} xs={12}>
                        <FileFilterCheckboxGroup
                            title="Lead Organization Study ID"
                            options={this.props.trialIds}
                            onChange={this.props.onTrialIdChange}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FileFilterCheckboxGroup
                            title="Assay Type"
                            options={this.props.experimentalStrategies}
                            onChange={this.props.onExperimentalStrategyChange}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FileFilterCheckboxGroup
                            title="Data Format"
                            options={this.props.dataFormats}
                            onChange={this.props.onDataFormatChange}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}
