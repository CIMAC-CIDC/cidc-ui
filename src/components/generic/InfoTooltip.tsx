import React from "react";
import { Tooltip } from "@material-ui/core";
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
    <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 0.5 }}>{children}</span>
        <LargeFontTooltip title={text} placement="bottom-start">
            <span role="tooltip">
                <InfoOutlined color="primary" fontSize="inherit" />
            </span>
        </LargeFontTooltip>
    </span>
);

export default InfoTooltip;
