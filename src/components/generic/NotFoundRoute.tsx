import React from "react";
import { Typography, Grid } from "@material-ui/core";
import { useRootStyles } from "../../rootStyles";

const NotFoundRoute: React.FC = () => {
    const classes = useRootStyles();

    return (
        <div className={classes.centeredPage}>
            <Grid container direction="column" alignItems="center" spacing={2}>
                <Grid item>
                    <Typography variant="h3" color="textSecondary">
                        404 Not Found
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="h5">
                        Uh oh! This page does not exist.
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
};

export default NotFoundRoute;
