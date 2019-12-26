import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import uniq from "lodash/uniq";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";
import { colors } from "../../rootStyles";
import { withData, IDataContext } from "../data/DataProvider";
import { StringParam, ArrayParam, useQueryParams } from "use-query-params";
import { DataFile } from "../../model/file";

export const filterConfig = {
    search: StringParam,
    protocol_id: ArrayParam,
    data_format: ArrayParam,
    type: ArrayParam
};
export type Filters = ReturnType<typeof useQueryParams>[0];

const useStyles = makeStyles({
    container: {
        border: `1px solid ${colors.DARK_BLUE_GREY}`,
        borderRadius: 5
    }
});

const FileFilter: React.FunctionComponent<IDataContext> = props => {
    const classes = useStyles();

    const [filters, setFilters] = useQueryParams(filterConfig);
    const updateFilters = (k: keyof typeof filterConfig) => (v: string) => {
        if (k === "search") {
            setFilters({ search: v });
        } else {
            const current = filters[k];
            const updated = current
                ? current.includes(v)
                    ? current.filter(f => f !== v)
                    : [...current, v]
                : [v];
            setFilters({ [k]: updated });
        }
    };

    const extractDistinct = (column: keyof DataFile) =>
        uniq(props.files.map(f => f[column] as string));
    const trialIds = extractDistinct("trial");
    const types = extractDistinct("assay_type");
    const formats = extractDistinct("data_format");

    return (
        <div className={classes.container}>
            <Grid container>
                <Grid item xs={12}>
                    <FileFilterCheckboxGroup
                        title="Protocol Identifier"
                        config={{
                            options: trialIds,
                            checked: filters.protocol_id
                        }}
                        onChange={updateFilters("protocol_id")}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FileFilterCheckboxGroup
                        title="Type"
                        config={{
                            options: types,
                            checked: filters.type
                        }}
                        onChange={updateFilters("type")}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FileFilterCheckboxGroup
                        title="Format"
                        config={{
                            options: formats,
                            checked: filters.data_format
                        }}
                        onChange={updateFilters("protocol_id")}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default withData(FileFilter);
