import { Grid } from "@material-ui/core";
import * as React from "react";
import FileFilterCheckboxGroup, {
    IFilterConfig
} from "./FileFilterCheckboxGroup";

export interface IFileFilterProps {
    trialIds: IFilterConfig;
    experimentalStrategies: IFilterConfig;
    dataFormats: IFilterConfig;
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
                            title="Protocol Identifier"
                            config={this.props.trialIds}
                            onChange={this.props.onTrialIdChange}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FileFilterCheckboxGroup
                            title="Type"
                            config={this.props.experimentalStrategies}
                            onChange={this.props.onExperimentalStrategyChange}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FileFilterCheckboxGroup
                            title="Format"
                            config={this.props.dataFormats}
                            onChange={this.props.onDataFormatChange}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}
