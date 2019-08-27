import * as React from "react";
import { Grid, CircularProgress } from "@material-ui/core";
import { CircularProgressProps } from "@material-ui/core/CircularProgress";

const Loader: React.FunctionComponent<CircularProgressProps> = props => (
    <Grid container alignContent="center" justify="center">
        <Grid item>
            <CircularProgress {...props} />
        </Grid>
    </Grid>
);

export default Loader;
