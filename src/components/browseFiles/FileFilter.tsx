import * as React from "react";
import {
    Grid,
    Card,
    FormControlLabel,
    Switch,
    Typography
} from "@material-ui/core";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";
import { ArrayParam, useQueryParams, BooleanParam } from "use-query-params";
import { withIdToken } from "../identity/AuthProvider";
import { getFilterFacets } from "../../api/api";
import { Dictionary } from "lodash";

export const filterConfig = {
    analysis_friendly: BooleanParam,
    trial_id: ArrayParam,
    upload_type: ArrayParam
};
export type Filters = ReturnType<typeof useQueryParams>[0];

const FileFilter: React.FunctionComponent<{ token: string }> = props => {
    const [facets, setFacets] = React.useState<Dictionary<string[]> | null>();
    React.useEffect(() => {
        getFilterFacets(props.token).then(setFacets);
    }, [props.token]);

    const [filters, setFilters] = useQueryParams(filterConfig);
    const updateFilters = (k: keyof typeof filterConfig) => (v: string) => {
        if (k === "analysis_friendly") {
            setFilters({ [k]: v === "true" || undefined });
        } else {
            const currentVals = filters[k] || [];
            const vals = currentVals.includes(v)
                ? currentVals.filter(val => val !== v)
                : [...currentVals, v];
            setFilters({ [k]: vals });
        }
    };
    // Default to filter only analysis-friendly files
    React.useEffect(() => {
        setFilters({ analysis_friendly: true });
    }, [setFilters]);

    return (
        <Card>
            <Grid container direction="column">
                <Grid item>
                    <FormControlLabel
                        style={{ padding: 10 }}
                        control={
                            <Switch
                                color="primary"
                                checked={!!filters.analysis_friendly}
                                onChange={(_, checked) =>
                                    updateFilters("analysis_friendly")(
                                        checked.toString()
                                    )
                                }
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Show only analysis-friendly files
                            </Typography>
                        }
                    />
                </Grid>
                {facets && facets.trial_id && (
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            title="Protocol Identifiers"
                            config={{
                                options: facets.trial_id,
                                checked: filters.trial_id
                            }}
                            onChange={updateFilters("trial_id")}
                        />
                    </Grid>
                )}
                {facets && facets.upload_type && (
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            title="Data Categories"
                            config={{
                                options: facets.upload_type,
                                checked: filters.upload_type
                            }}
                            onChange={updateFilters("upload_type")}
                        />
                    </Grid>
                )}
            </Grid>
        </Card>
    );
};

export default withIdToken(FileFilter);
