import * as React from "react";
import { Grid, Card, Typography, Box, Button } from "@material-ui/core";
import FilterCheckboxGroup, {
    FilterCheckboxGroupPlaceholder
} from "./FilterCheckboxGroup";
import { useFilterFacets, ARRAY_PARAM_DELIM } from "./FilterProvider";

const Filters: React.FunctionComponent = () => {
    const {
        facets,
        filters,
        hasFilters,
        clearFilters,
        updateFilters
    } = useFilterFacets();

    const trialIdCheckboxes = (
        <Grid item xs={12}>
            {facets ? (
                <FilterCheckboxGroup
                    noTopDivider
                    title="Protocol Identifiers"
                    config={{
                        options: facets.trial_ids.map(t => {
                            if (typeof t === "string") {
                                return { label: t };
                            }
                            return t;
                        }),
                        checked: filters.trial_ids
                    }}
                    onChange={updateFilters("trial_ids")}
                />
            ) : (
                <FilterCheckboxGroupPlaceholder />
            )}
        </Grid>
    );

    const otherFacetCheckboxes = facets ? (
        Object.entries(facets.facets).map(([facetHeader, options]) => {
            const checked = filters.facets
                ?.filter(facet => facet.startsWith(facetHeader))
                .map(facet => {
                    return facet
                        .split(ARRAY_PARAM_DELIM)
                        .slice(1)
                        .join(ARRAY_PARAM_DELIM);
                });
            return (
                <Grid key={facetHeader} item xs={12}>
                    <FilterCheckboxGroup
                        title={facetHeader}
                        config={{
                            options,
                            checked
                        }}
                        onChange={args => {
                            let facetValues: string[];
                            if (Array.isArray(args)) {
                                facetValues = args;
                            } else {
                                const splitArgs = args.split(ARRAY_PARAM_DELIM);
                                if (splitArgs.length > 1) {
                                    facetValues = splitArgs;
                                } else {
                                    facetValues = [args];
                                }
                            }

                            return updateFilters("facets")([
                                facetHeader,
                                ...facetValues
                            ]);
                        }}
                    />
                </Grid>
            );
        })
    ) : (
        <Grid item>
            <FilterCheckboxGroupPlaceholder />
        </Grid>
    );

    return (
        <>
            <Box marginBottom={1}>
                <Grid
                    container
                    justify="space-between"
                    alignItems="baseline"
                    wrap="nowrap"
                >
                    <Grid item>
                        <Box margin={1}>
                            <Typography color="textSecondary" variant="caption">
                                Refine your search
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        {hasFilters && (
                            <Button
                                variant="outlined"
                                onClick={() => clearFilters()}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Box>
            <Card>
                <Grid container direction="column">
                    {trialIdCheckboxes}
                    {otherFacetCheckboxes}
                </Grid>
            </Card>
        </>
    );
};

export default Filters;
