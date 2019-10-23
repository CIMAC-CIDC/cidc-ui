import * as React from "react";
import { RouteComponentProps } from "react-router";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { withIdToken, AuthContext } from "../identity/AuthProvider";
import { Grid, Typography, Divider } from "@material-ui/core";
import { CloudDownload, Fingerprint } from "@material-ui/icons";
import CopyToClipboardButton from "../generic/CopyToClipboardButton";
import { widths } from "../../rootStyles";

export interface IAssayInstructionsProps
    extends RouteComponentProps<{ assay: string }> {
    title: string;
    token?: string;
    tokenButton?: boolean;
}

const CopyIdToken: React.FunctionComponent = () => {
    const authData = React.useContext(AuthContext);

    return (
        <CopyToClipboardButton
            title="Identity Token"
            copyValue={authData ? authData.idToken : ""}
            variant="contained"
            color="primary"
            startIcon={<Fingerprint />}
            disabled={!authData}
        />
    );
};

const AssayInstructions: React.FunctionComponent<
    IAssayInstructionsProps
> = props => {
    const assay = props.match.params.assay;
    const path = `cidc-documentation/master/assays/${assay}.md`;

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    style={{ width: widths.markdownWidth }}
                >
                    <Grid item>
                        <Typography variant="h4">{props.title}</Typography>
                    </Grid>
                    <Grid item>
                        {props.tokenButton ? (
                            <CopyIdToken />
                        ) : (
                            <TemplateDownloadButton
                                color="primary"
                                templateName={assay}
                                templateType="metadata"
                                variant="contained"
                                startIcon={<CloudDownload />}
                            >
                                Download an empty {assay} template
                            </TemplateDownloadButton>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item style={{ padding: "1em 0" }}>
                <Divider />
            </Grid>
            <Grid item>
                <CIDCGithubMarkdown
                    path={path}
                    insertIdToken
                    trimLeadingHeader
                />
            </Grid>
        </Grid>
    );
};

export default withIdToken<IAssayInstructionsProps>(AssayInstructions);
