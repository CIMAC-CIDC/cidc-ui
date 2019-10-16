import * as React from "react";
import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { InfoContext } from "../info/InfoProvider";

// Given a template type and name, get the path to the corresponding
// xlsx file in the static/ folder.
export function nameToURL(type: string, name: string) {
    const fmtedName = name.toLowerCase().replace(" ", "_");
    return `${process.env.PUBLIC_URL}/static/xlsx/${type}/${fmtedName}_template.xlsx`;
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
