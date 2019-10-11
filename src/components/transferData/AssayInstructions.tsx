import * as React from "react";
import { RouteComponentProps } from "react-router";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import { withIdToken } from "../identity/AuthProvider";

export interface IAssayInstructionsProps
    extends RouteComponentProps<{ assay: string }> {
    token?: string;
}

const AssayInstructions: React.FunctionComponent<
    IAssayInstructionsProps
> = props => {
    const path = `cidc-documentation/master/assays/${props.match.params.assay}.md`;
    const token = props.token;

    return <CIDCGithubMarkdown path={path} authToken={token} />;
};

export default withIdToken(AssayInstructions);
