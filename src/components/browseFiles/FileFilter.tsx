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
    raw_files: BooleanParam,
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
        if (k === "raw_files") {
            setFilters({ [k]: v === "true" || undefined });
        } else {
            const currentVals = filters[k] || [];
            const vals = currentVals.includes(v)
                ? currentVals.filter(val => val !== v)
                : [...currentVals, v];
            setFilters({ [k]: vals });
        }
    };

    return (
        <Card>
            <Grid container direction="column">
                <Grid item>
                    <FormControlLabel
                        style={{ padding: 10 }}
                        control={
                            <Switch
                                size="small"
                                color="primary"
                                checked={!!filters.raw_files}
                                onChange={(_, checked) =>
                                    updateFilters("raw_files")(
                                        checked.toString()
                                    )
                                }
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Include raw files in results
                            </Typography>
                        }
                    />
                </Grid>
                {facets && facets.trial_id && (
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            searchable
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
