import * as React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { FormGroup, FormControlLabel, Toolbar, Typography } from '@material-ui/core';
import autobind from 'autobind-decorator';

export interface IFileFilterCheckboxGroupProps {
    title: string;
    options: string[];
    onChange: (option: string) => void;
}

export default class FileFilterCheckboxGroup extends React.Component<IFileFilterCheckboxGroupProps, {}> {

    @autobind
    private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(event.target.value);
    }

    public render() {
        return (
            <div>
                <Toolbar className="File-filter-toolbar">
                    <Typography className="File-filter-toolbar-text">{this.props.title}</Typography>
                </Toolbar>
                <div className="File-filter-checkboxes">
                    <FormGroup>
                        {this.props.options.map(dataFormat => {
                            return (
                                <FormControlLabel key={dataFormat} label={dataFormat} control={
                                    <Checkbox value={dataFormat} onChange={this.handleChange}
                                        className="File-filter-checkbox" />
                                } />
                            );
                        })}
                    </FormGroup>
                </div>
            </div>
        );
    }
}
