import { Grid, Typography, makeStyles } from "@material-ui/core";
import * as React from "react";
import FileFilter from "./FileFilter";
import FileTable from "./FileTable";
import { RouteComponentProps } from "react-router";
import { withData, IDataContext } from "../data/DataProvider";
import Loader from "../generic/Loader";

const filterWidth = 300;
const maxTableWidth = 1500;
const useStyles = makeStyles({
    container: {
        margin: "auto",
        padding: 20,
        maxWidth: filterWidth + maxTableWidth
    },
    filters: { width: filterWidth },
    table: { maxWidth: maxTableWidth, width: `calc(100% - ${filterWidth}px)` }
});

const BrowseFilesPage: React.FC<RouteComponentProps & IDataContext> = props => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            {props.files.length === 0 && (
                <Grid container justify="center">
                    <Grid item>
                        <Typography>No files found.</Typography>
                    </Grid>
                </Grid>
            )}
            {props.files.length > 0 && (
                <Grid container spacing={3}>
                    <Grid item className={classes.filters}>
                        <FileFilter />
                    </Grid>
                    <Grid item className={classes.table}>
                        {props.dataStatus === "fetching" && <Loader />}
                        {props.dataStatus === "fetched" && (
                            <FileTable history={props.history} />
                        )}
                        {props.dataStatus === "failed" && (
                            <Typography>
                                Encountered an error fetching file data.
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            )}
        </div>
    );
};

export default withData(BrowseFilesPage);
