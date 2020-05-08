import React from "react";
import { Grid } from "@material-ui/core";
import { Route } from "react-router-dom";
import TrialsTable from "./TrialsTable";
import TrialsForm from "./TrialForm";
import { useRootStyles } from "../../rootStyles";

const TrialsPage: React.FC = () => {
    const classes = useRootStyles();

    return (
        <Grid container className={classes.centeredPage} justify="center">
            <Route path="/trials" exact>
                <TrialsTable />
            </Route>
            <Route path="/trials/edit/:trial_id">
                <TrialsForm />
            </Route>
        </Grid>
    );
};

export default TrialsPage;
