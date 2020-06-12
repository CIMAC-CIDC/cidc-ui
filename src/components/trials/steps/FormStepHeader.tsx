import React from "react";
import { Typography } from "@material-ui/core";

export interface IFormStepHeader {
    title: string;
    subtitle: string;
}

const FormStepHeader: React.FC<IFormStepHeader> = ({ title, subtitle }) => {
    return (
        <>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <Typography variant="subtitle1">{subtitle}</Typography>
        </>
    );
};

export default FormStepHeader;
