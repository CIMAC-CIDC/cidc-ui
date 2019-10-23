import { makeStyles } from "@material-ui/core";

export const colors = {
    LIGHT_BLUE: "#95cfff",
    LIGHT_GREY: "#cfd0d0",
    DARK_BLUE_GREY: "#3b4856"
};

export const useRootStyles = makeStyles({
    root: {
        minWidth: "640px !important",
        height: "100vh"
    },
    markdown: {
        width: 880,
        margin: "auto"
    },
    content: {
        padding: "1em 3em 3em",
        minHeight: 960,
        background: "white"
    },
    centeredPage: {
        width: 1200,
        margin: "auto"
    }
});
