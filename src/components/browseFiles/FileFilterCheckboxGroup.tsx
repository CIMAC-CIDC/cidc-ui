import {
    makeStyles,
    FormGroup,
    FormControlLabel,
    Typography,
    Divider,
    Grid
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import * as React from "react";
import { FilterList } from "@material-ui/icons";

const useFilterStyles = makeStyles({
    header: {
        paddingLeft: 10
    },
    title: {
        fontWeight: "bold",
        fontSize: ".8rem"
    },
    checkboxGroup: {
        maxHeight: "10.5rem",
        flexWrap: "nowrap",
        overflow: "auto",
        paddingLeft: 15
    },
    checkboxLabel: {
        "& .MuiFormControlLabel-label": {
            fontSize: ".9rem"
        }
    },
    checkbox: {
        padding: 3
    }
});

export interface IFilterConfig {
    options: string[];
    checked: string[] | undefined;
}

export interface IFileFilterCheckboxGroupProps {
    title: string;
    config: IFilterConfig;
    noTopBar?: boolean;
    onChange: (option: string) => void;
}

const FileFilterCheckboxGroup: React.FunctionComponent<
    IFileFilterCheckboxGroupProps
> = props => {
    const classes = useFilterStyles();

    const checked = props.config.checked || [];

    return (
        <>
            {!props.noTopBar && <Divider />}
            <Grid
                container
                alignItems="center"
                wrap="nowrap"
                className={classes.header}
                spacing={1}
            >
                <Grid item>
                    <FilterList />
                </Grid>
                <Grid item>
                    <Typography
                        className={classes.title}
                        variant="overline"
                        gutterBottom
                    >
                        {props.title}
                    </Typography>
                </Grid>
            </Grid>
            <Divider />
            <FormGroup className={classes.checkboxGroup} row={false}>
                {props.config.options.map(opt => (
                    <FormControlLabel
                        className={classes.checkboxLabel}
                        key={opt}
                        label={opt}
                        control={
                            <Checkbox
                                className={classes.checkbox}
                                checked={checked.includes(opt)}
                                onClick={() => props.onChange(opt)}
                            />
                        }
                    />
                ))}
            </FormGroup>
        </>
    );
};

export default FileFilterCheckboxGroup;
