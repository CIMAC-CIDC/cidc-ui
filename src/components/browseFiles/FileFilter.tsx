import * as React from "react";
import {
    Grid,
    Card,
    CardHeader,
    Typography,
    CardContent
} from "@material-ui/core";
import uniq from "lodash/uniq";
import FileFilterCheckboxGroup from "./FileFilterCheckboxGroup";
import { withData, IDataContext } from "../data/DataProvider";
import { ArrayParam, useQueryParams } from "use-query-params";
import { DataFile } from "../../model/file";
import { FilterList } from "@material-ui/icons";

export const filterConfig = {
    protocol_id: ArrayParam,
    data_format: ArrayParam,
    type: ArrayParam
};
export type Filters = ReturnType<typeof useQueryParams>[0];

const FileFilter: React.FunctionComponent<IDataContext> = props => {
    const [filters, setFilters] = useQueryParams(filterConfig);
    const updateFilters = (k: keyof typeof filterConfig) => (vs: string[]) => {
        setFilters({ [k]: vs });
    };

    const extractDistinct = (column: keyof DataFile) =>
        uniq(props.files.map(f => f[column] as string));
    const trialIds = extractDistinct("trial");
    const types = extractDistinct("assay_type");
    const formats = extractDistinct("data_format");

    return (
        <Card>
            <CardHeader
                avatar={<FilterList />}
                title={<Typography variant="h6">Filters</Typography>}
            />
            <CardContent>
                <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            title="Protocol Identifiers"
                            config={{
                                options: trialIds,
                                checked: filters.protocol_id
                            }}
                            onChange={updateFilters("protocol_id")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            title="Data Categories"
                            config={{
                                options: types,
                                checked: filters.type
                            }}
                            onChange={updateFilters("type")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FileFilterCheckboxGroup
                            title="File Formats"
                            config={{
                                options: formats,
                                checked: filters.data_format
                            }}
                            onChange={updateFilters("data_format")}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default withData(FileFilter);
