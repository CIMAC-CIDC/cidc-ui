import {
    makeStyles,
    FormGroup,
    FormControlLabel,
    Typography,
    Divider,
    Grid,
    Chip,
    Button,
    TextField,
    Box,
    IconButton,
    Tooltip
} from "@material-ui/core";
import Checkbox, { CheckboxProps } from "@material-ui/core/Checkbox";
import * as React from "react";
import {
    FilterList,
    Search,
    KeyboardArrowDown,
    KeyboardArrowUp
} from "@material-ui/icons";
import useSearch from "../../util/useSearch";
import { Dictionary, map, some } from "lodash";
import { useUserContext } from "../identity/UserProvider";
import { withStyles } from "@material-ui/styles";

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
        paddingLeft: 15,
        paddingRight: 15
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

type FacetOptions = string[] | Dictionary<string[]>;

export interface IFilterConfig<T extends FacetOptions> {
    options: T;
    checked: string[] | undefined;
}

export interface IFileFilterCheckboxGroupProps<T extends FacetOptions> {
    title: string;
    config: IFilterConfig<T>;
    noTopDivider?: boolean;
    searchable?: boolean;
    onChange: (option: string | string[]) => void;
}

function FileFilterCheckboxGroup<T extends FacetOptions>(
    props: IFileFilterCheckboxGroupProps<T>
) {
    const classes = useFilterStyles();
    const checked = props.config.checked || ([] as string[]);

    return (
        <>
            {props.noTopDivider || <Divider />}
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
                {Array.isArray(checked) && (
                    <Grid item>
                        <Grid container spacing={1}>
                            {map(checked, checkedOpt => (
                                <Grid item key={checkedOpt}>
                                    <Chip
                                        label={checkedOpt}
                                        size="small"
                                        onDelete={() =>
                                            props.onChange(checkedOpt)
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Grid>
            <Divider />
            {Array.isArray(props.config.options) ? (
                props.searchable ? (
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
                )
            ) : (
                <NestedBoxes
                    checked={checked}
                    options={props.config.options as Dictionary<string[]>}
                    onChange={props.onChange}
                />
            )}
        </>
    );
}

interface IPermsAwareCheckboxProps extends CheckboxProps {
    facetType: string;
    facetSubtype?: string;
    label?: React.ReactNode;
}

const PermsTooltip = withStyles(() => ({
    tooltip: {
        margin: -5
    }
}))(Tooltip);

const PermsAwareCheckbox: React.FC<IPermsAwareCheckboxProps> = ({
    label,
    facetType,
    facetSubtype,
    ...checkboxProps
}) => {
    const classes = useFilterStyles();
    const { permissions, role } = useUserContext();

    const hasPermission =
        role === "cidc-admin" ||
        some(
            permissions || [],
            p =>
                p.trial_id === facetType ||
                p.upload_type.startsWith(facetType.toLowerCase())
        );

    const { checked, onClick, ...otherCheckboxProps } = checkboxProps;

    const control = (
        <FormControlLabel
            className={classes.checkboxLabel}
            label={label || facetSubtype || facetType}
            disabled={!hasPermission}
            control={
                <Checkbox
                    className={classes.checkbox}
                    checked={checked}
                    onClick={hasPermission ? onClick : undefined}
                    {...otherCheckboxProps}
                />
            }
        />
    );

    return hasPermission ? (
        control
    ) : (
        <PermsTooltip title="unauthorized to view">{control}</PermsTooltip>
    );
};

interface IHelperProps<T extends FacetOptions> {
    options: T;
    checked: string[];
    onChange: IFileFilterCheckboxGroupProps<T>["onChange"];
}

const Checkboxes = ({
    options,
    checked,
    onChange,
    parentType
}: Omit<IHelperProps<string[]>, "onChange"> & {
    parentType?: string;
    onChange: (opt: string) => void;
}) => {
    const classes = useFilterStyles();

    return (
        <FormGroup className={classes.checkboxGroup} row={false}>
            {options.map(opt => {
                return (
                    <PermsAwareCheckbox
                        key={opt}
                        facetType={parentType || opt}
                        facetSubtype={parentType ? opt : undefined}
                        checked={checked.includes(
                            parentType ? `${parentType}|${opt}` : opt
                        )}
                        onClick={() => onChange(opt)}
                    />
                );
            })}
        </FormGroup>
    );
};

const BoxesWithSearch = ({
    options,
    checked,
    onChange
}: IHelperProps<string[]>) => {
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

const BoxesWithShowMore = ({
    options,
    checked,
    onChange
}: IHelperProps<string[]>) => {
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

const NestedBoxes = ({
    checked,
    options,
    onChange
}: IHelperProps<Dictionary<string[]>>) => {
    const classes = useFilterStyles();
    const topLevelOptions = Object.keys(options);
    const [openOptions, setOpenOptions] = React.useState<string[]>(checked);

    return (
        <>
            {topLevelOptions.map(opt => {
                const subchecked = checked.filter(check =>
                    check.startsWith(opt)
                );
                const isOpen =
                    openOptions.filter(openOpt => openOpt.startsWith(opt))
                        .length > 0;
                const suboptions = options[opt];
                const isChecked = suboptions.length === subchecked.length;

                const TopCheckboxLabel = (
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>{opt}</Grid>
                        <Grid item>
                            <Typography color="textSecondary" variant="caption">
                                ({suboptions.length} file categories)
                            </Typography>
                        </Grid>
                    </Grid>
                );

                return (
                    <FormGroup
                        key={opt}
                        className={classes.checkboxGroup}
                        row={false}
                    >
                        <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                <PermsAwareCheckbox
                                    facetType={opt}
                                    label={TopCheckboxLabel}
                                    checked={isChecked}
                                    onClick={() => onChange(opt)}
                                />
                            </Grid>
                            <Grid item>
                                {isOpen ? (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setOpenOptions(
                                                openOptions.filter(
                                                    o => o !== opt
                                                )
                                            );
                                        }}
                                    >
                                        <KeyboardArrowUp />
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setOpenOptions([
                                                ...openOptions,
                                                opt
                                            ]);
                                        }}
                                    >
                                        <KeyboardArrowDown />
                                    </IconButton>
                                )}
                            </Grid>
                        </Grid>
                        {isOpen && (
                            <Box marginLeft={1}>
                                <Checkboxes
                                    parentType={opt}
                                    options={suboptions}
                                    checked={subchecked}
                                    onChange={fileType =>
                                        onChange([opt, fileType])
                                    }
                                />
                            </Box>
                        )}
                    </FormGroup>
                );
            })}
        </>
    );
};

export default FileFilterCheckboxGroup;
