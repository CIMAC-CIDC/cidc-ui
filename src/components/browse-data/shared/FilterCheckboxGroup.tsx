import {
    makeStyles,
    FormGroup,
    FormControlLabel,
    Typography,
    Divider,
    Grid,
    Button,
    Box,
    IconButton,
    Tooltip
} from "@material-ui/core";
import Checkbox, { CheckboxProps } from "@material-ui/core/Checkbox";
import * as React from "react";
import {
    FilterList,
    KeyboardArrowDown,
    KeyboardArrowUp
} from "@material-ui/icons";
import { Dictionary, some, partition, sortBy, range } from "lodash";
import { useUserContext } from "../../identity/UserProvider";
import InfoTooltip from "../../generic/InfoTooltip";
import { IFacetInfo } from "./FilterProvider";
import { Skeleton } from "@material-ui/lab";

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

export interface IFilterConfig {
    options: IFacetInfo[] | Dictionary<IFacetInfo[]>;
    checked: string[] | undefined;
}

export interface IFilterCheckboxGroupProps {
    title: string;
    config: IFilterConfig;
    noTopDivider?: boolean;
    onChange: (option: string | string[]) => void;
}

function FilterCheckboxGroup(props: IFilterCheckboxGroupProps) {
    const classes = useFilterStyles();
    const checked = props.config.checked || ([] as string[]);

    return (
        <>
            {props.noTopDivider || <Divider />}
            <Grid
                className={classes.header}
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
            <Divider />
            {Array.isArray(props.config.options) ? (
                <BoxesWithShowMore
                    checked={checked}
                    options={props.config.options}
                    onChange={props.onChange}
                />
            ) : (
                <NestedBoxes
                    checked={checked}
                    options={props.config.options as Dictionary<IFacetInfo[]>}
                    onChange={props.onChange}
                />
            )}
        </>
    );
}

export const FilterCheckboxGroupPlaceholder: React.FC = () => {
    const classes = useFilterStyles();

    return (
        <Grid
            className={classes.header}
            container
            direction="column"
            spacing={1}
        >
            <Grid item>
                <Skeleton width={150} />
            </Grid>
            {range(5).map(i => (
                <Grid key={i} item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Skeleton width={25} />
                        </Grid>
                        <Grid item>
                            <Skeleton width={100} />
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

interface IPermsAwareCheckboxProps extends CheckboxProps {
    facetType: string;
    facetSubtype?: string;
    label?: React.ReactNode;
    onClickLabel?: () => void;
}

const PermsAwareCheckbox: React.FC<IPermsAwareCheckboxProps> = ({
    label,
    facetType,
    facetSubtype,
    onClickLabel,
    ...checkboxProps
}) => {
    const classes = useFilterStyles();
    const { permissions, role } = useUserContext();

    const hasPermission =
        role === "cidc-admin" ||
        role === "nci-biobank-user" ||
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
            label={
                <Typography
                    variant="body2"
                    onClick={e => {
                        if (onClickLabel) {
                            e.preventDefault();
                            onClickLabel();
                        }
                    }}
                >
                    {label || facetSubtype || facetType}
                </Typography>
            }
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
        <Tooltip
            title={
                <Typography variant="caption">
                    You don't have permission to view data matching this filter.
                </Typography>
            }
            placement="bottom"
        >
            {control}
        </Tooltip>
    );
};

interface IHelperProps<T extends IFilterConfig["options"]> {
    options: T;
    checked: string[];
    onChange: IFilterCheckboxGroupProps["onChange"];
}

const Checkboxes = ({
    options,
    checked,
    onChange,
    parentType
}: Omit<IHelperProps<IFacetInfo[]>, "onChange"> & {
    parentType?: string;
    onChange: (opt: string) => void;
}) => {
    const classes = useFilterStyles();
    const sortedOptions = sortBy(options, "label");

    return (
        <FormGroup className={classes.checkboxGroup} row={false}>
            {sortedOptions.map(({ label, description }) => (
                <PermsAwareCheckbox
                    key={label}
                    data-testid={label}
                    label={
                        description ? (
                            <InfoTooltip text={description}>
                                {label}
                            </InfoTooltip>
                        ) : (
                            label
                        )
                    }
                    facetType={parentType || label}
                    facetSubtype={parentType ? label : undefined}
                    checked={checked.includes(
                        parentType ? `${parentType}|${label}` : label
                    )}
                    onClick={() => onChange(label)}
                />
            ))}
        </FormGroup>
    );
};

const BoxesWithShowMore = ({
    options,
    checked,
    onChange
}: IHelperProps<IFacetInfo[]>) => {
    const classes = useFilterStyles();
    const [showMore, setShowMore] = React.useState<boolean>(false);
    const showShowMore = options.length > NUM_INITIAL_FILTERS;
    const [checkedOptions, uncheckedOptions] = partition(options, ({ label }) =>
        checked.includes(label)
    );
    const truncatedUncheckedOptions =
        showShowMore && showMore
            ? uncheckedOptions
            : uncheckedOptions.slice(0, NUM_INITIAL_FILTERS);

    return (
        <>
            <Checkboxes
                options={checkedOptions}
                checked={checked}
                onChange={onChange}
            />
            {checkedOptions.length > 0 &&
                truncatedUncheckedOptions.length > 0 && (
                    <Divider variant="middle" />
                )}
            <Checkboxes
                options={truncatedUncheckedOptions}
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
}: IHelperProps<Dictionary<IFacetInfo[]>>) => {
    const classes = useFilterStyles();
    const topLevelOptions = Object.keys(options);
    const [openOptions, setOpenOptions] = React.useState<string[]>(checked);
    const addOpenOption = (opt: string) => {
        setOpenOptions([...openOptions, opt]);
    };
    const removeOpenOption = (opt: string) => {
        setOpenOptions(openOptions.filter(o => !o.startsWith(opt)));
    };
    const toggleOpenOption = (opt: string) => {
        openOptions.filter(o => o.startsWith(opt)).length > 0
            ? removeOpenOption(opt)
            : addOpenOption(opt);
    };

    return (
        <>
            {topLevelOptions.map(opt => {
                const subchecked = checked.filter(check =>
                    check.startsWith(opt)
                );
                const hasCheckedSuboptions = subchecked.length > 0;
                const isOpen =
                    hasCheckedSuboptions ||
                    openOptions.filter(o => o.startsWith(opt)).length > 0;
                const suboptions = options[opt];
                const isChecked = suboptions.length === subchecked.length;

                const TopCheckboxLabel = (
                    <>
                        <span style={{ marginRight: 5 }}>{opt}</span>
                        <Typography color="textSecondary" variant="caption">
                            ({suboptions.length} file categor
                            {suboptions.length === 1 ? "y" : "ies"})
                        </Typography>
                    </>
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
                                    data-testid={opt}
                                    facetType={opt}
                                    label={TopCheckboxLabel}
                                    onClickLabel={() => toggleOpenOption(opt)}
                                    checked={isChecked}
                                    onClick={() => onChange(opt)}
                                />
                            </Grid>
                            <Grid item>
                                <IconButton
                                    data-testid={`toggle open ${opt}`}
                                    size="small"
                                    disabled={hasCheckedSuboptions}
                                    onClick={() =>
                                        isOpen
                                            ? removeOpenOption(opt)
                                            : addOpenOption(opt)
                                    }
                                >
                                    {isOpen ? (
                                        <KeyboardArrowUp />
                                    ) : (
                                        <KeyboardArrowDown />
                                    )}
                                </IconButton>
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

export default FilterCheckboxGroup;
