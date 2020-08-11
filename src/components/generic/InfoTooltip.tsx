import React from "react";
import { Typography, Tooltip, Box } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";

export interface IInfoTooltipProps {
    text: string;
}

const LargeFontTooltip = withStyles({
    tooltip: {
        fontSize: 12
    }
})(Tooltip);

const InfoTooltip: React.FC<IInfoTooltipProps> = ({ text, children }) => (
    <Box display="flex" alignItems="center">
        <Box marginRight={0.5}>
            <Typography variant="body2">{children}</Typography>
        </Box>
        <LargeFontTooltip title={text} placement="bottom-start">
            <InfoOutlined color="primary" fontSize="inherit" />
        </LargeFontTooltip>
    </Box>
);

export default InfoTooltip;
