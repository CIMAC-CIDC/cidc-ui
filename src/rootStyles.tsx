import React from "react";
import {
    createMuiTheme,
    makeStyles,
    MuiThemeProvider
} from "@material-ui/core";

export const colors = {
    LIGHT_BLUE: "#95cfff",
    LIGHT_GREY: "#cfd0d0",
    DARK_BLUE_GREY: "#3b4856",
    logoLightBlue: "#0C9FEB",
    logoDarkBlue: "#1E66BE",
    warningDarkRed: "#F93154"
};

export const widths = {
    maxPageWidth: 1400,
    minPageWidth: 1215
};

export const theme = createMuiTheme({
    typography: {
        fontFamily: '"Karla", sans-serif'
    },
    palette: {
        primary: {
            main: colors.logoDarkBlue,
            light: colors.logoLightBlue
        },
        secondary: {
            main: colors.warningDarkRed
        }
    },
    props: {
        MuiCard: {
            variant: "outlined"
        }
    },
    overrides: {
        MuiTab: {
            root: {
                "&$selected": {
                    color: "black"
                }
            }
        }
    }
});

export const CIDCThemeProvider: React.FC = ({ children }) => {
    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export const useRootStyles = makeStyles({
    root: {
        minWidth: "640px !important",
        height: "100vh"
    },
    content: {
        paddingTop: "1rem",
        paddingBottom: "2rem",
        minHeight: 960
    },
    centeredPage: {
        paddingRight: "3rem",
        paddingLeft: "3rem",
        minWidth: widths.minPageWidth,
        maxWidth: widths.maxPageWidth,
        margin: "auto",
        overflowX: "auto",
        overflowY: "hidden"
    }
});
