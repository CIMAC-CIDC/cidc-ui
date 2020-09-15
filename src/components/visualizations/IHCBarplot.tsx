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
    MenuItem,
    Typography
} from "@material-ui/core";
import ContactAnAdmin from "../generic/ContactAnAdmin";

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

const IHCPlotControls: React.FC<{
    dataColumns: string[];
    dataColumn: string;
    facet: string;
    setDataColumn: (c: string) => void;
    setFacet: (f: string) => void;
}> = props => {
    return (
        <Card>
            <CardContent>
                <Grid container direction="column" spacing={3}>
                    <Grid item>
                        <FormControl component="fieldset">
                            <FormLabel>Y-Axis</FormLabel>
                            <Select
                                value={props.dataColumn}
                                onChange={e =>
                                    props.setDataColumn(
                                        e.target.value as string
                                    )
                                }
                            >
                                {props.dataColumns.map(c => {
                                    return (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl component="fieldset">
                            <FormLabel>Color by</FormLabel>
                            <RadioGroup
                                value={props.facet}
                                onChange={(_, v) => props.setFacet(v)}
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
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const IHCBarplot: React.FC<IHCBarplotProps> = props => {
    const [facet, setFacet] = React.useState<string>(
        IHC_CONFIG.facets[0].value
    );

    const columns = new Set(Object.keys(props.data[0]));
    const dataColumns = IHC_CONFIG.possibleDataColumns.filter(c =>
        columns.has(c)
    );
    const [dataColumn, setDataColumn] = React.useState<string>(
        dataColumns.length > 0 ? dataColumns[0] : ""
    );

    const facetGroups = groupBy(props.data, facet);
    const colors = chroma.brewer.Set1.slice();
    const data = map(facetGroups, (rows, key) => ({
        x: map(rows, "cimac_id"),
        y: map(rows, dataColumn),
        type: "bar",
        marker: { color: colors.shift() },
        name: key
    }));

    const plot = (
        <Grid container direction="row" wrap="nowrap" spacing={1}>
            <Grid item>
                <IHCPlotControls
                    dataColumn={dataColumn}
                    dataColumns={dataColumns}
                    setDataColumn={setDataColumn}
                    facet={facet}
                    setFacet={setFacet}
                />
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
                            title: {
                                text: "Sample<br>(hover to view CIMAC ID)"
                            },
                            categorymode: "array",
                            categoryarray: map(props.data, "cimac_id"),
                            showticklabels: false
                        },
                        margin: { t: 10 }
                    }}
                    config={{ displaylogo: false }}
                />
            </Grid>
        </Grid>
    );

    const noDataColumnsMessage = (
        <Typography color="textSecondary">
            Oops! The portal failed to build an IHC expression distribution
            visualization for this data. Please <ContactAnAdmin lower /> to let
            us know about this issue.
        </Typography>
    );

    return (
        <Card>
            <CardHeader title="IHC Expression Distribution" />
            <CardContent>
                {dataColumns.length > 0 ? plot : noDataColumnsMessage}
            </CardContent>
        </Card>
    );
};

export default IHCBarplot;
