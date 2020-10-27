import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useRootStyles } from "../../rootStyles";

const sidebarWidth = 300;
const useStyles = makeStyles({
    sidebar: { width: sidebarWidth, paddingRight: "1em" },
    main: {
        width: `calc(100% - ${sidebarWidth}px)`
    }
});

export interface IPageWithSidebarProps {
    sidebar: React.ReactElement;
}

const PageWithSidebar: React.FC<IPageWithSidebarProps> = ({
    sidebar,
    children
}) => {
    const rootClasses = useRootStyles();
    const classes = useStyles();

    return (
        <Grid
            className={rootClasses.centeredPage}
            container
            justify="space-between"
            wrap="nowrap"
        >
            <Grid item className={classes.sidebar}>
                {sidebar}
            </Grid>
            <Grid item className={classes.main}>
                {children}
            </Grid>
        </Grid>
    );
};

export default PageWithSidebar;
