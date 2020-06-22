import {
    makeStyles,
    FormGroup,
    FormControlLabel,
    Typography,
    Divider,
    Grid,
    Chip,
    Button,
    TextField
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import * as React from "react";
import { FilterList, Search } from "@material-ui/icons";
import useSearch from "../../util/useSearch";

const searchBoxMargin = 15;

const useFilterStyles = makeStyles({
    header: {
        padding: 10
    },
    title: {
        fontWeight: "bold",
        fontSize: ".8rem"
    },
    checkboxGroup: {
        flexWrap: "nowrap",
        paddingLeft: 15
    },
    checkboxLabel: {
        "& .MuiFormControlLabel-label": {
            fontSize: ".9rem"
        }
    },
    checkbox: {
        padding: 3
    },
    showMoreButton: {
        fontSize: ".7rem"
    },
    search: {
        margin: searchBoxMargin / 2,
        width: `calc(100% - ${searchBoxMargin}px)`
    }
});

const NUM_INITIAL_FILTERS = 5;

export interface IFilterConfig {
    options: string[];
    checked: string[] | undefined;
}

export interface IFileFilterCheckboxGroupProps {
    title: string;
    config: IFilterConfig;
    searchable?: boolean;
    onChange: (option: string) => void;
}

const FileFilterCheckboxGroup: React.FunctionComponent<IFileFilterCheckboxGroupProps> = props => {
    const classes = useFilterStyles();
    const checked = props.config.checked || [];

    return (
        <>
            <Divider />
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
            {props.searchable ? (
                <BoxesWithSearch
                    checked={checked}
                    options={props.config.options}
                    onChange={props.onChange}
                />
            ) : (
                <BoxesWithShowMore
                    checked={checked}
                    options={props.config.options}
                    onChange={props.onChange}
                />
            )}
        </>
    );
};

interface IHelperProps {
    options: string[];
    checked: string[];
    onChange: (opt: string) => void;
}

const Checkboxes = ({ options, checked, onChange }: IHelperProps) => {
    const classes = useFilterStyles();

    return (
        <FormGroup className={classes.checkboxGroup} row={false}>
            {options.map(opt => (
                <FormControlLabel
                    className={classes.checkboxLabel}
                    key={opt}
                    label={opt}
                    control={
                        <Checkbox
                            className={classes.checkbox}
                            checked={checked.includes(opt)}
                            onClick={() => onChange(opt)}
                        />
                    }
                />
            ))}
        </FormGroup>
    );
};

const BoxesWithSearch = ({ options, checked, onChange }: IHelperProps) => {
    const classes = useFilterStyles();
    const searchOptions = useSearch(options);
    const [query, setQuery] = React.useState<string>("");

    return (
        <>
            <TextField
                className={classes.search}
                size="small"
                label="Search Protocol IDs"
                variant="outlined"
                value={query}
                onChange={e => setQuery(e.currentTarget.value)}
                InputProps={{ endAdornment: <Search /> }}
            />
            <Checkboxes
                options={searchOptions(query)}
                checked={checked}
                onChange={onChange}
            />
        </>
    );
};

const BoxesWithShowMore = ({ options, checked, onChange }: IHelperProps) => {
    const classes = useFilterStyles();
    const [showMore, setShowMore] = React.useState<boolean>(false);
    const showShowMore = options.length > NUM_INITIAL_FILTERS;
    const truncatedOptions =
        showShowMore && showMore
            ? options
            : options.slice(0, NUM_INITIAL_FILTERS);

    return (
        <>
            <Checkboxes
                options={truncatedOptions}
                checked={checked}
                onChange={onChange}
            />
            {showShowMore && (
                <Grid container justify="center">
                    <Button
                        className={classes.showMoreButton}
                        size="small"
                        color="primary"
                        onClick={() => setShowMore(!showMore)}
                    >
                        {showMore ? "show fewer options" : "show more options"}
                    </Button>
                </Grid>
            )}
        </>
    );
};

export default FileFilterCheckboxGroup;
