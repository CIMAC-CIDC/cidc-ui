import React from "react";
import { Grid } from "@material-ui/core";
import { widths } from "../../rootStyles";

const SchemaPage: React.FC = () => {
    return (
        <Grid container justify="center">
            <Grid item>
                <iframe
                    title="CIDC Schema"
                    src="https://cimac-cidc.github.io/cidc-schemas/docs/index.html"
                    width={widths.minPageWidth - 100}
                    height={900}
                    frameBorder="0"
                />
            </Grid>
        </Grid>
    );
};

export default SchemaPage;
