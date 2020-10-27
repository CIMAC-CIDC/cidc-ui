import * as React from "react";
import CIDCGithubMarkdown from "../generic/CIDCGithubMarkdown";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { withIdToken, AuthContext } from "../identity/AuthProvider";
import { Grid, Typography, Divider, Box } from "@material-ui/core";
import { CloudDownload, Fingerprint } from "@material-ui/icons";
import CopyToClipboardButton from "../generic/CopyToClipboardButton";
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
            disableElevation
            title="Identity Token"
            copyValue={authData ? authData.idToken : ""}
            variant="outlined"
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
        <>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                wrap="nowrap"
            >
                <Grid item xs={8}>
                    <Typography variant="h4">{props.title}</Typography>
                </Grid>
                <Grid item>
                    {props.tokenButton ? (
                        <CopyIdToken />
                    ) : (
                        <TemplateDownloadButton
                            verboseLabel
                            fullWidth
                            disableElevation
                            color="primary"
                            templateName={name}
                            templateType={props.uploadType}
                            variant="outlined"
                            startIcon={<CloudDownload />}
                        />
                    )}
                </Grid>
            </Grid>
            <Box py={2}>
                <Divider />
            </Box>
            <CIDCGithubMarkdown path={path} insertIdToken trimLeadingHeader />
        </>
    );
};

export default withIdToken<IUploadInstructionsProps>(UploadInstructions);
