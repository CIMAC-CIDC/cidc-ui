import * as React from "react";
import { RouteComponentProps } from "react-router";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { withIdToken, AuthContext } from "../identity/AuthProvider";
import { Grid, Button } from "@material-ui/core";
import { CloudDownload, Fingerprint } from "@material-ui/icons";
import CopyToClipboard from "react-copy-to-clipboard";

export interface IAssayInstructionsProps
    extends RouteComponentProps<{ assay: string }> {
    token?: string;
    tokenButton?: boolean;
}

const CopyIdToken: React.FunctionComponent = () => {
    const authData = React.useContext(AuthContext);
    const [copied, setCopied] = React.useState<boolean>(false);

    return (
        <CopyToClipboard text={authData ? authData.idToken : ""}>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Fingerprint />}
                disabled={!authData}
                onClick={() => setCopied(true)}
            >
                {copied ? "Token Copied!" : "Copy Identity Token"}
            </Button>
        </CopyToClipboard>
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
                <div
                    style={{
                        // A hack to place the download button
                        // next to the markdown doc title
                        float: "right",
                        top: 10,
                        padding: 0,
                        marginBottom: -50
                    }}
                >
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
                </div>
            </Grid>
            <Grid item>
                <CIDCGithubMarkdown path={path} insertIdToken />
            </Grid>
        </Grid>
    );
};

export default withIdToken<IAssayInstructionsProps>(AssayInstructions);
