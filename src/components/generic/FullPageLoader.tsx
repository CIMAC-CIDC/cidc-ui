import { Fade, Grid } from "@material-ui/core";
import React from "react";
import logo from "../../logo.png";
import Loader from "./Loader";

export const fullPageLoaderAltText = "loading the CIDC portal";

const FullPageLoader: React.FC = () => {
    const [fadeIn, setFadeIn] = React.useState<boolean>(false);
    React.useEffect(() => {
        setFadeIn(true);
    }, []);

    return (
        <Fade in={fadeIn} timeout={1000}>
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
        </Fade>
    );
};

export default FullPageLoader;
