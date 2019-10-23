import { Grid } from "@material-ui/core";
import * as React from "react";
import FileFilterCheckboxGroup, {
    IFilterConfig
} from "./FileFilterCheckboxGroup";
import { colors } from "../../rootStyles";

export interface IFileFilterProps {
    trialIds: IFilterConfig;
    experimentalStrategies: IFilterConfig;
    dataFormats: IFilterConfig;
    onTrialIdChange: (trialId: string) => void;
    onExperimentalStrategyChange: (experimentalStrategy: string) => void;
    onDataFormatChange: (dataFormat: string) => void;
}

const FileFilter: React.FunctionComponent<IFileFilterProps> = props => {
    return (
        <div
            style={{
                border: `1px solid ${colors.DARK_BLUE_GREY}`,
                borderRadius: 5
            }}
        >
            <Grid container={true}>
                <Grid item={true} xs={12}>
                    <FileFilterCheckboxGroup
                        title="Protocol Identifier"
                        config={props.trialIds}
                        onChange={props.onTrialIdChange}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <FileFilterCheckboxGroup
                        title="Type"
                        config={props.experimentalStrategies}
                        onChange={props.onExperimentalStrategyChange}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <FileFilterCheckboxGroup
                        title="Format"
                        config={props.dataFormats}
                        onChange={props.onDataFormatChange}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default FileFilter;
