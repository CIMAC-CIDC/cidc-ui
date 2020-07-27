import * as React from "react";
import { Grid, Card, Typography, Box } from "@material-ui/core";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";
import { ArrayParam, useQueryParams } from "use-query-params";
import { withIdToken } from "../identity/AuthProvider";
import { getFilterFacets } from "../../api/api";
import { Dictionary, uniq } from "lodash";

export interface IFacets {
    trial_ids: string[];
    facets: Dictionary<Dictionary<string[]> | string[]>;
}

export const filterConfig = {
    trial_ids: ArrayParam,
    facets: ArrayParam
};
export type Filters = ReturnType<typeof useQueryParams>[0];

const ARRAY_PARAM_DELIM = "|";

const FileFilter: React.FunctionComponent<{ token: string }> = props => {
    const [facets, setFacets] = React.useState<IFacets | undefined>();
    React.useEffect(() => {
        getFilterFacets(props.token).then(setFacets);
    }, [props.token]);

    const [filters, setFilters] = useQueryParams(filterConfig);
    const toggleFilter = (k: keyof IFacets, v: string) => {
        const currentValues = filters[k] || [];
        const updatedValues = currentValues.includes(v)
            ? currentValues.filter(cv => cv !== v)
            : [...currentValues, v];
        setFilters({ [k]: updatedValues });
    };
    const updateFilters = (k: keyof IFacets) => (v: string | string[]) => {
        if (!facets) {
            return;
        }

        if (Array.isArray(v)) {
            const [category, facet, subfacet] = v;
            if (subfacet || Array.isArray(facets[k][category])) {
                toggleFilter(k, v.join(ARRAY_PARAM_DELIM));
            } else {
                const keyFilters = filters[k] || [];
                const facetFamily = [category, facet].join(ARRAY_PARAM_DELIM);
                const facetsInFamily = facets[k][category][
                    facet
                ].map((f: string) => [facetFamily, f].join(ARRAY_PARAM_DELIM));
                const hasAllFilters =
                    keyFilters.filter(f => f.startsWith(facetFamily)).length ===
                    facetsInFamily.length;
                const newFilters = hasAllFilters
                    ? keyFilters.filter(f => !f.startsWith(facetFamily))
                    : uniq([...keyFilters, ...facetsInFamily]);
                setFilters({ [k]: newFilters });
            }
        } else {
            toggleFilter(k, v);
        }
    };

    if (!facets) {
        return null;
    }

    return (
        <>
            <Box marginBottom={1}>
                <Typography color="textSecondary" variant="caption">
                    Refine your search
                </Typography>
            </Box>
            <Card>
                <Grid container direction="column">
                    {facets.trial_ids && (
                        <Grid item xs={12}>
                            <FileFilterCheckboxGroup<string[]>
                                searchable
                                noTopDivider
                                title="Protocol Identifiers"
                                config={{
                                    options: facets.trial_ids,
                                    checked: filters.trial_ids
                                }}
                                onChange={updateFilters("trial_ids")}
                            />
                        </Grid>
                    )}
                    {facets.facets &&
                        Object.entries(facets.facets).map(
                            ([facetHeader, options]) => {
                                const checked = filters.facets
                                    ?.filter(facet =>
                                        facet.startsWith(facetHeader)
                                    )
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
                                                    const splitArgs = args.split(
                                                        ARRAY_PARAM_DELIM
                                                    );
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
                            }
                        )}
                </Grid>
            </Card>
        </>
    );
};

export default withIdToken(FileFilter);
