import * as React from "react";
import { Button, Grid } from "@material-ui/core";
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

    // For, e.g., templateName == WES, we expect multiple template types
    // (wes_fastq and wes_bam). In that case, multiple buttons will render.
    const types =
        info &&
        info.supportedTemplates[templateType].filter(typ =>
            typ.startsWith(name)
        );
    if (!types) {
        return null;
    }

    const templateURLs = types.map(typ => nameToURL(templateType, typ));

    return (
        <Grid container direction="column" spacing={1}>
            {templateURLs.map((url, i) => (
                <Grid item key={url}>
                    <form method="get" action={url}>
                        <Button type="submit" {...buttonProps}>
                            Download an empty {types[i]} template
                        </Button>
                    </form>
                </Grid>
            ))}
        </Grid>
    );
};

export default TemplateDownloadButton;
