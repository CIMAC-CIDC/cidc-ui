import React from "react";
import { Grid } from "@material-ui/core";
import { useRootStyles, widths } from "../../rootStyles";

const SchemaPage: React.FC = () => {
    const classes = useRootStyles();
    return (
        <Grid container justify="center" className={classes.centeredPage}>
            <Grid item>
                <iframe
                    title="CIDC Schema"
                    src="https://cimac-cidc.github.io/cidc-schemas/docs/index.html"
                    width={widths.minPageWidth}
                    height={900}
                    frameBorder="0"
                />
            </Grid>
        </Grid>
    );
};

export default SchemaPage;
