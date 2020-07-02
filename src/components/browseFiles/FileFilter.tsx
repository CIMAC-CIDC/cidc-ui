import * as React from "react";
import { Grid, Card, Typography, Box } from "@material-ui/core";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";
import { ArrayParam, useQueryParams, JsonParam } from "use-query-params";
import { withIdToken } from "../identity/AuthProvider";
import { getFilterFacets } from "../../api/api";
import { Dictionary } from "lodash";

export interface IFacets {
    trial_ids: string[];
    assay_types: Dictionary<string[]>;
    clinical_types: string[];
    sample_types: string[];
}

export const filterConfig = {
    trial_ids: ArrayParam,
    assay_types: JsonParam,
    clinical_types: ArrayParam,
    sample_types: ArrayParam
};
export type Filters = ReturnType<typeof useQueryParams>[0];

const FileFilter: React.FunctionComponent<{ token: string }> = props => {
    const [facets, setFacets] = React.useState<IFacets | undefined>();
    React.useEffect(() => {
        getFilterFacets(props.token).then(setFacets);
    }, [props.token]);

    const [filters, setFilters] = useQueryParams(filterConfig);
    const updateFilters = (k: keyof IFacets) => (
        v: [string, string] | string
    ) => {
        let vals;
        if (k === "assay_types") {
            const currentAssayTypes = filters[k] || {};
            if (Array.isArray(v)) {
                const [assayType, fileType] = v;
                const currentFileTypes: string[] =
                    currentAssayTypes[assayType] || [];
                vals = {
                    ...currentAssayTypes,
                    [assayType]: currentFileTypes.includes(fileType)
                        ? currentFileTypes.filter(t => t !== fileType)
                        : [...currentFileTypes, fileType]
                };
            } else {
                const currentFileTypes = currentAssayTypes[v] || [];
                const allFileTypes = facets![k][v];
                vals =
                    currentFileTypes.length === allFileTypes.length
                        ? { ...currentAssayTypes, [v]: [] }
                        : { ...currentAssayTypes, [v]: allFileTypes };
            }
        } else {
            const currentVals = (filters[k] as string[]) || ([] as string[]);
            vals = currentVals.includes(v as string)
                ? currentVals.filter(val => val !== v)
                : [...currentVals, v];
        }
        setFilters({ [k]: vals });
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
                    {facets.assay_types && (
                        <Grid item xs={12}>
                            <FileFilterCheckboxGroup
                                title="Assay Types"
                                config={{
                                    options: facets.assay_types,
                                    checked: filters.assay_types
                                }}
                                onChange={updateFilters("assay_types")}
                            />
                        </Grid>
                    )}
                    {facets.sample_types && (
                        <Grid item xs={12}>
                            <FileFilterCheckboxGroup
                                title="Sample Types"
                                config={{
                                    options: facets.sample_types,
                                    checked: filters.sample_types
                                }}
                                onChange={updateFilters("sample_types")}
                            />
                        </Grid>
                    )}
                    {facets.clinical_types && (
                        <Grid item xs={12}>
                            <FileFilterCheckboxGroup
                                title="Clinical Types"
                                config={{
                                    options: facets.clinical_types,
                                    checked: filters.clinical_types
                                }}
                                onChange={updateFilters("clinical_types")}
                            />
                        </Grid>
                    )}
                </Grid>
            </Card>
        </>
    );
};

export default withIdToken(FileFilter);
