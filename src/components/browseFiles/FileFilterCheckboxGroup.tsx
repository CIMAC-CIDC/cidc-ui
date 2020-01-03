import { makeStyles, TextField, Chip, Grid } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { Autocomplete } from "@material-ui/lab";
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
    onChange: (options: string[]) => void;
}

const FileFilterCheckboxGroup: React.FunctionComponent<
    IFileFilterCheckboxGroupProps
> = props => {
    const classes = useFilterStyles();

    const handleChange = (_: React.ChangeEvent<{}>, values: any) => {
        props.onChange(values);
    };

    const checked = props.config.checked || [];

    return (
        <Autocomplete
            multiple
            autoComplete
            disableCloseOnSelect
            disableClearable
            options={props.config.options}
            value={checked}
            onChange={handleChange}
            renderInput={params => (
                <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    label={props.title}
                    placeholder="Select multiple"
                    InputLabelProps={{ shrink: true }}
                />
            )}
            renderOption={option => (
                <React.Fragment key={option}>
                    <Checkbox
                        value={option}
                        className={classes.checkbox}
                        checked={checked.includes(option)}
                    ></Checkbox>
                    {option}
                </React.Fragment>
            )}
            renderTags={tags => (
                <Grid container spacing={1}>
                    {tags.map((tag: string) => (
                        <Grid item key={tag}>
                            <Chip
                                label={tag}
                                onDelete={() =>
                                    props.onChange(
                                        tags.filter((t: string) => t !== tag)
                                    )
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        />
    );
};

export default FileFilterCheckboxGroup;
