import { Grid, makeStyles } from "@material-ui/core";
import * as React from "react";
import FileFilter from "./FileFilter";
import FileTable from "./FileTable";
import { RouteComponentProps } from "react-router";

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

const BrowseFilesPage: React.FC<RouteComponentProps> = props => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                <Grid item className={classes.filters}>
                    <FileFilter />
                </Grid>
                <Grid item className={classes.table}>
                    <FileTable history={props.history} />
                </Grid>
            </Grid>
        </div>
    );
};

export default BrowseFilesPage;
