import * as React from "react";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { withIdToken, AuthContext } from "../identity/AuthProvider";
import { Grid, Typography, Divider } from "@material-ui/core";
import { CloudDownload, Fingerprint } from "@material-ui/icons";
import CopyToClipboardButton from "../generic/CopyToClipboardButton";
import { widths } from "../../rootStyles";
import { IUploadDocsPageProps } from "./UploadDocsPages";

export interface IUploadInstructionsProps {
    title: string;
    docPath: string;
    uploadType: IUploadDocsPageProps["uploadType"];
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

const UploadInstructions: React.FunctionComponent<IUploadInstructionsProps> = props => {
    const path = `cidc-documentation/master/${props.docPath}`;
    const pathParts = props.docPath.split("/");
    const name = pathParts[pathParts.length - 1].slice(0, -3);

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    style={{ width: widths.markdownWidth }}
                    wrap="nowrap"
                >
                    <Grid item>
                        <Typography variant="h4">{props.title}</Typography>
                    </Grid>
                    <Grid item>
                        {props.tokenButton ? (
                            <CopyIdToken />
                        ) : (
                            <TemplateDownloadButton
                                fullWidth
                                verboseLabel
                                color="primary"
                                templateName={name}
                                templateType={props.uploadType}
                                variant="contained"
                                startIcon={<CloudDownload />}
                            />
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

export default withIdToken<IUploadInstructionsProps>(UploadInstructions);
