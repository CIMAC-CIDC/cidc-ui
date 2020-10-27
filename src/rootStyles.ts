import { makeStyles } from "@material-ui/core";

export const colors = {
    LIGHT_BLUE: "#95cfff",
    LIGHT_GREY: "#cfd0d0",
    DARK_BLUE_GREY: "#3b4856"
};

export const widths = {
    maxPageWidth: 1400,
    minPageWidth: 1100
};

export const useRootStyles = makeStyles(theme => ({
    root: {
        minWidth: "640px !important",
        height: "100vh"
    },
    content: {
        paddingTop: "1rem",
        paddingBottom: "2rem",
        minHeight: 960,
        background: "white"
    },
    centeredPage: {
        paddingRight: "3rem",
        paddingLeft: "3rem",
        minWidth: widths.minPageWidth,
        maxWidth: widths.maxPageWidth,
        margin: "auto"
    }
}));
