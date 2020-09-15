import React from "react";
import Plot from "react-plotly.js";
import chroma from "chroma-js";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import { DataFile } from "../../model/file";
import {
    Grid,
    Card,
    CardContent,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    CardHeader,
    Select,
    MenuItem
} from "@material-ui/core";

export interface IHCBarplotProps {
    data: DataFile["ihc_combined_plot"];
}

const IHC_CONFIG = {
    facets: [
        { label: "Cohort", value: "cohort_name" },
        { label: "Collection Event", value: "collection_event_name" }
    ],
    possibleDataColumns: [
        "tumor_proportion_score",
        "tps",
        "combined_positive_score",
        "cps",
        "h_score",
        "intensity",
        "percent_expression"
    ]
};

const IHCBarplot: React.FC<IHCBarplotProps> = props => {
    const [facet, setFacet] = React.useState<string>(
        IHC_CONFIG.facets[0].value
    );

    const columns = new Set(Object.keys(props.data[0]));
    const dataColumns = IHC_CONFIG.possibleDataColumns.filter(c =>
        columns.has(c)
    );
    const [dataColumn, setDataColumn] = React.useState<string>(dataColumns[0]);

    const facetGroups = groupBy(props.data, facet);
    const colors = chroma.brewer.Set1.slice();
    const data = map(facetGroups, (rows, key) => ({
        x: map(rows, "cimac_id"),
        y: map(rows, dataColumn),
        type: "bar",
        marker: { color: colors.shift() },
        name: key
    }));

    return (
        <Card>
            <CardHeader title="IHC Expression Distribution" />
            <CardContent>
                <Grid
                    container
                    direction="row"
                    alignItems="center"
                    wrap="nowrap"
                >
                    <Grid item>
                        <Grid container direction="column" spacing={1}>
                            <Grid item>
                                <Card>
                                    <CardContent>
                                        <FormControl component="fieldset">
                                            <FormLabel>Y-Axis</FormLabel>
                                            <Select
                                                value={dataColumn}
                                                onChange={e =>
                                                    setDataColumn(
                                                        e.target.value as string
                                                    )
                                                }
                                            >
                                                {dataColumns.map(c => {
                                                    return (
                                                        <MenuItem
                                                            key={c}
                                                            value={c}
                                                        >
                                                            {c}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item>
                                <Card>
                                    <CardContent>
                                        <FormControl component="fieldset">
                                            <FormLabel>Color by</FormLabel>
                                            <RadioGroup
                                                value={facet}
                                                onChange={(_, v) => setFacet(v)}
                                            >
                                                {IHC_CONFIG.facets.map(f => (
                                                    <FormControlLabel
                                                        key={f.value}
                                                        value={f.value}
                                                        control={<Radio />}
                                                        label={f.label}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Plot
                            data={data}
                            layout={{
                                showlegend: true,
                                yaxis: {
                                    anchor: "x",
                                    title: { text: dataColumn }
                                },
                                xaxis: {
                                    anchor: "y",
                                    title: { text: "CIMAC ID" },
                                    categorymode: "array",
                                    categoryarray: map(props.data, "cimac_id")
                                }
                            }}
                            config={{ displaylogo: false }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default IHCBarplot;
