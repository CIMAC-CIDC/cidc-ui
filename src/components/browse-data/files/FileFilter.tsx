import * as React from "react";
import { Grid, Card, Typography, Box, Button } from "@material-ui/core";
import FileFilterCheckboxGroup, {
    FileFilterCheckboxGroupPlaceholder
} from "../shared/FileFilterCheckboxGroup";
import { withIdToken } from "../../identity/AuthProvider";
import { useFilterFacets, ARRAY_PARAM_DELIM } from "../shared/FilterProvider";

const FileFilter: React.FunctionComponent<{ token: string }> = props => {
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
                <FileFilterCheckboxGroup
                    noTopDivider
                    title="Protocol Identifiers"
                    config={{
                        options: facets.trial_ids.map(label => ({
                            label
                        })),
                        checked: filters.trial_ids
                    }}
                    onChange={updateFilters("trial_ids")}
                />
            ) : (
                <FileFilterCheckboxGroupPlaceholder />
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
                    <FileFilterCheckboxGroup
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
            <FileFilterCheckboxGroupPlaceholder />
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

export default withIdToken(FileFilter);
