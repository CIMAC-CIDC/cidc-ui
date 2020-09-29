import { Button, ButtonGroup, Grid, makeStyles } from "@material-ui/core";
import * as React from "react";
import Filters from "./shared/Filters";
import FileTable from "./files/FileTable";
import { RouteComponentProps } from "react-router";
import TrialTable from "./trials/TrialTable";
import FilterProvider from "./shared/FilterProvider";
import { BooleanParam, useQueryParam } from "use-query-params";

const filterWidth = 300;
const maxTableWidth = 1500;
const minTableWidth = 850;
const useStyles = makeStyles({
    container: {
        margin: "auto",
        minWidth: filterWidth + minTableWidth
    },
    filters: { width: filterWidth },
    data: {
        minWidth: minTableWidth,
        maxWidth: maxTableWidth,
        width: `calc(100% - ${filterWidth}px)`
    }
});

const BrowseDataPage: React.FC<RouteComponentProps> = props => {
    const classes = useStyles();

    const [showFileView, setShowFileView] = useQueryParam(
        "file_view",
        BooleanParam
    );

    const viewToggleButton = (
        <ButtonGroup size="small" color="primary">
            <Button
                variant={showFileView ? "outlined" : "contained"}
                onClick={() => setShowFileView(false)}
            >
                trial view
            </Button>
            <Button
                variant={showFileView ? "contained" : "outlined"}
                onClick={() => setShowFileView(true)}
            >
                file view
            </Button>
        </ButtonGroup>
    );

    return (
        <FilterProvider trialView={!showFileView}>
            <Grid
                className={classes.container}
                container
                spacing={3}
                wrap="nowrap"
            >
                <Grid item className={classes.filters}>
                    <Filters />
                </Grid>
                <Grid item className={classes.data}>
                    {showFileView ? (
                        <FileTable
                            history={props.history}
                            viewToggleButton={viewToggleButton}
                        />
                    ) : (
                        <TrialTable viewToggleButton={viewToggleButton} />
                    )}
                </Grid>
            </Grid>
        </FilterProvider>
    );
};

export default BrowseDataPage;
