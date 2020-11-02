import { Grid } from "@material-ui/core";
import React from "react";
import logo from "../../logo.svg";
import FadeInOnMount from "./FadeInOnMount";
import Loader from "./Loader";

export const fullPageLoaderAltText = "loading the CIDC portal";

const FullPageLoader: React.FC = () => {
    return (
        <FadeInOnMount timeout={1000}>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                style={{ height: "75vh" }}
            >
                <Grid item>
                    <img
                        src={logo}
                        style={{ height: 100 }}
                        alt={fullPageLoaderAltText}
                    />
                </Grid>
                <Grid item>
                    <Loader />
                </Grid>
            </Grid>
        </FadeInOnMount>
    );
};

export default FullPageLoader;
