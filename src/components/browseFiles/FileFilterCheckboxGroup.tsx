import {
    FormControlLabel,
    FormGroup,
    Toolbar,
    Typography,
    makeStyles
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import * as React from "react";
import { colors } from "../../rootStyles";

const useFilterStyles = makeStyles({
    header: {
        justifyContent: "center",
        backgroundColor: colors.DARK_BLUE_GREY,
        color: "white",
        minHeight: 36
    },
    checkboxGroup: {
        flexWrap: "nowrap",
        paddingLeft: 10,
        maxHeight: 200,
        overflow: "auto"
    },
    checkbox: {
        padding: 5
    }
});

export interface IFilterConfig {
    options: string[];
    checked: string[] | undefined;
}

export interface IFileFilterCheckboxGroupProps {
    title: string;
    config: IFilterConfig;
    onChange: (option: string) => void;
}

const FileFilterCheckboxGroup: React.FunctionComponent<
    IFileFilterCheckboxGroupProps
> = props => {
    const classes = useFilterStyles();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(event.target.value);
    };

    const checked = props.config.checked || [];

    return (
        <div>
            <Toolbar className={classes.header} disableGutters>
                <Typography>{props.title}</Typography>
            </Toolbar>
            <FormGroup className={classes.checkboxGroup}>
                {props.config.options.map((dataFormat: string) => {
                    return (
                        <FormControlLabel
                            key={dataFormat}
                            label={dataFormat}
                            control={
                                <Checkbox
                                    value={dataFormat}
                                    checked={checked.includes(dataFormat)}
                                    onChange={handleChange}
                                    className={classes.checkbox}
                                />
                            }
                        />
                    );
                })}
            </FormGroup>
        </div>
    );
};

export default FileFilterCheckboxGroup;
