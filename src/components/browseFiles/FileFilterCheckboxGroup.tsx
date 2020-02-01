import {
    makeStyles,
    FormGroup,
    FormControlLabel,
    Typography,
    Divider,
    Grid,
    Chip
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import * as React from "react";
import { FilterList } from "@material-ui/icons";

const useFilterStyles = makeStyles({
    header: {
        padding: 10
    },
    title: {
        fontWeight: "bold",
        fontSize: ".8rem"
    },
    checkboxGroup: {
        maxHeight: "12.5rem",
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
            <Grid container direction="column" className={classes.header}>
                <Grid item>
                    <Grid
                        container
                        alignItems="center"
                        wrap="nowrap"
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
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        {checked.map(checkedOpt => (
                            <Grid item key={checkedOpt}>
                                <Chip
                                    label={checkedOpt}
                                    size="small"
                                    onDelete={() => props.onChange(checkedOpt)}
                                />
                            </Grid>
                        ))}
                    </Grid>
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
