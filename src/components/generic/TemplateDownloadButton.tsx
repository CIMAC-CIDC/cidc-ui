import * as React from "react";
import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { InfoContext } from "../info/InfoProvider";

// Given a template type and name, get the API URL for downloading that template.
export function nameToURL(type: string, name: string) {
    const fmtedName = name.toLowerCase().replace(" ", "_");
    return `${process.env.REACT_APP_API_URL}/info/templates/${type}/${fmtedName}`;
}

export interface ITemplateDownloadButtonProps extends ButtonProps {
    templateType: "metadata" | "manifests";
    templateName: string;
}

const TemplateDownloadButton: React.FunctionComponent<
    ITemplateDownloadButtonProps
> = ({ templateName: name, templateType, ...buttonProps }) => {
    const info = React.useContext(InfoContext);

    const hasURL = info && info.supportedTemplates[templateType].includes(name);
    if (!hasURL) {
        return null;
    }

    const templateURL = nameToURL(templateType, name);

    return (
        <form method="get" action={templateURL}>
            <Button type="submit" {...buttonProps} />
        </form>
    );
};

export default TemplateDownloadButton;
