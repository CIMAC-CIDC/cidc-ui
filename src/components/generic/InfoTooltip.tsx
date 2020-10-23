import React from "react";
import { Grid, Tooltip, Typography } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";

export interface IInfoTooltipProps {
    text: string;
}

const InfoTooltip: React.FC<IInfoTooltipProps> = ({ text, children }) => (
    <Grid container spacing={1}>
        <Grid item>{children}</Grid>
        <Grid item>
            <Tooltip
                title={<Typography variant="caption">{text}</Typography>}
                placement="right-end"
            >
                <span role="tooltip">
                    <InfoOutlined color="primary" fontSize="inherit" />
                </span>
            </Tooltip>
        </Grid>
    </Grid>
);

export default InfoTooltip;
