import { makeStyles } from "@material-ui/core";

export const colors = {
    LIGHT_BLUE: "#95cfff",
    LIGHT_GREY: "#cfd0d0",
    DARK_BLUE_GREY: "#3b4856"
};

export const widths = {
    pageWidth: 1000,
    markdownWidth: 750
};

export const useRootStyles = makeStyles({
    root: {
        minWidth: "640px !important",
        height: "100vh"
    },
    markdown: {
        width: widths.markdownWidth,
        margin: "auto"
    },
    content: {
        padding: "1em 3em 3em",
        minHeight: 960,
        background: "white"
    },
    centeredPage: {
        width: widths.pageWidth,
        margin: "auto"
    }
});
