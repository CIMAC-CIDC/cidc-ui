import {
    FormControlLabel,
    FormGroup,
    Toolbar,
    Typography
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import autobind from "autobind-decorator";
import * as React from "react";

export interface IFilterConfig {
    options: string[];
    checked: string[];
}

export interface IFileFilterCheckboxGroupProps {
    title: string;
    config: IFilterConfig;
    onChange: (option: string) => void;
}

export default class FileFilterCheckboxGroup extends React.Component<
    IFileFilterCheckboxGroupProps,
    {}
> {
    @autobind
    private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(event.target.value);
    }

    public render() {
        return (
            <div>
                <Toolbar className="File-filter-toolbar">
                    <Typography className="File-filter-toolbar-text">
                        {this.props.title}
                    </Typography>
                </Toolbar>
                <div className="File-filter-checkboxes">
                    <FormGroup>
                        {this.props.config.options.map((dataFormat: string) => {
                            return (
                                <FormControlLabel
                                    key={dataFormat}
                                    label={dataFormat}
                                    control={
                                        <Checkbox
                                            value={dataFormat}
                                            checked={this.props.config.checked.includes(
                                                dataFormat
                                            )}
                                            onChange={this.handleChange}
                                            className="File-filter-checkbox"
                                        />
                                    }
                                />
                            );
                        })}
                    </FormGroup>
                </div>
            </div>
        );
    }
}
