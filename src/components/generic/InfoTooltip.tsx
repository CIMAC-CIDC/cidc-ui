import React from "react";
import { Grid, Typography, Tooltip } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";

export interface IInfoTooltipProps {
    text: string;
}

const InfoTooltip: React.FC<IInfoTooltipProps> = ({ text, children }) => (
    <Grid container spacing={1}>
        <Grid item>
            <Typography variant="body2">{children}</Typography>
        </Grid>
        <Grid item>
            <Tooltip title={text} placement="bottom-start">
                <InfoOutlined color="primary" fontSize="inherit" />
            </Tooltip>
        </Grid>
    </Grid>
);

export default InfoTooltip;
