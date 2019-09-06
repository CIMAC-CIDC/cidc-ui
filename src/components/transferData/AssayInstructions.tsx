import * as React from "react";
import { RouteComponentProps } from "react-router";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";

const AssayInstructions: React.FunctionComponent<
    RouteComponentProps<{ assay: string }>
> = props => {
    const path = `cidc-documentation/master/assays/${
        props.match.params.assay
    }.md`;

    return <CIDCGithubMarkdown path={path} />;
};

export default AssayInstructions;
