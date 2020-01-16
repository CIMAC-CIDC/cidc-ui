import React from "react";
import Plot from "react-plotly.js";
import chroma from "chroma-js";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import { IHCBarplotJSON } from "../../model/file";
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
    config: IHCBarplotJSON;
}

const IHCBarplot: React.FC<IHCBarplotProps> = props => {
    const [facet, setFacet] = React.useState<string>(
        props.config.meta.facets[0]
    );

    const dataColumn = props.config.meta.tps_column;
    const facetGroups = groupBy(props.config.data, facet);
    const colors = chroma
        .scale("RdYlBu")
        .colors(Object.keys(facetGroups).length);
    const data = map(facetGroups, (rows, key) => ({
        x: map(rows, "cimac_id"),
        y: map(rows, dataColumn),
        type: "bar",
        marker: { color: colors.pop() },
        name: key
    }));

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            wrap="nowrap"
        >
            <Grid item>
                <Card>
                    <CardContent>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Color by</FormLabel>
                            <RadioGroup
                                value={facet}
                                onChange={(_, v) => setFacet(v)}
                            >
                                {props.config.meta.facets.map(name => (
                                    <FormControlLabel
                                        key={name}
                                        value={name}
                                        control={<Radio />}
                                        label={name}
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
                        yaxis: {
                            anchor: "x",
                            title: { text: "TPS" }
                        },
                        xaxis: {
                            anchor: "y",
                            title: { text: "CIMAC ID" },
                            categorymode: "array",
                            categoryarray: map(props.config.data, "cimac_id")
                        }
                    }}
                    config={{ displaylogo: false }}
                />
            </Grid>
        </Grid>
    );
};

export default IHCBarplot;
