import React from "react";
import { Grid } from "@material-ui/core";
import { Route } from "react-router-dom";
import TrialsTable from "./TrialsTable";
import TrialsForm from "./TrialForm";
import { widths } from "../../rootStyles";

const TrialsPage: React.FC = () => {
    return (
        <Grid container style={{ minWidth: widths.pageWidth }} justify="center">
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
