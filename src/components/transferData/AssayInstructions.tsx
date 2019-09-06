import * as React from "react";
import { RouteComponentProps } from "react-router";
import RemoteMarkdown from "./RemoteMarkdown";

const AssayInstructions: React.FunctionComponent<
    RouteComponentProps<{ assay: string }>
> = props => {
    const path = `cidc-documentation/master/assays/${
        props.match.params.assay
    }.md`;

    return <RemoteMarkdown path={path} />;
};

export default AssayInstructions;
