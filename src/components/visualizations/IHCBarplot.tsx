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
    Radio
} from "@material-ui/core";

export interface IHCBarplotProps {
    data: DataFile["ihc_combined_plot"];
}

const IHC_CONFIG = {
    facets: [
        { label: "Cohort", value: "cohort_name" },
        { label: "Collection Event", value: "collection_event_name" }
    ],
    dataColumn: "tumor_proportion_score"
};

const IHCBarplot: React.FC<IHCBarplotProps> = props => {
    const [facet, setFacet] = React.useState<string>(
        IHC_CONFIG.facets[0].value
    );

    const facetGroups = groupBy(props.data, facet);
    const colors = chroma.brewer.Set1.slice();
    const data = map(facetGroups, (rows, key) => ({
        x: map(rows, "cimac_id"),
        y: map(rows, IHC_CONFIG.dataColumn),
        type: "bar",
        marker: { color: colors.shift() },
        name: key
    }));

    return (
        <Grid container direction="row" alignItems="center" wrap="nowrap">
            <Grid item>
                <Card>
                    <CardContent>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Color by</FormLabel>
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
            <Grid item>
                <Plot
                    data={data}
                    layout={{
                        title: "IHC Expression Distribution",
                        showlegend: true,
                        yaxis: {
                            anchor: "x",
                            title: { text: "TPS" }
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
    );
};

export default IHCBarplot;
