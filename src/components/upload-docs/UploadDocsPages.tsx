import * as React from "react";
import {
    List,
    Grid,
    ListItem,
    ListItemText,
    Divider,
    ListSubheader
} from "@material-ui/core";
import { map } from "lodash";
import { RouteComponentProps, Route, withRouter, Redirect } from "react-router";
import UploadInstructions from "./UploadInstructions";
import { Dictionary } from "lodash";
import PageWithSidebar from "../generic/PageWithSidebar";

interface IDocPathConfig {
    path: string;
    label: string;
    title: string;
    assays?: boolean;
    analyses?: boolean;
}

const CLIInstructionsPath = "cli-instructions";

const pathConfigs: Dictionary<IDocPathConfig> = {
    wes: {
        path: "wes",
        label: "WES",
        title: "WES upload",
        assays: true,
        analyses: true
    },
    rna: {
        path: "rna",
        label: "RNA Expression",
        title: "RNA Expression upload",
        assays: true,
        analyses: true
    },
    cytof: {
        path: "cytof",
        label: "CyTOF",
        title: "CyTOF upload",
        assays: true,
        analyses: true
    },
    olink: {
        path: "olink",
        label: "Olink",
        title: "Olink upload",
        assays: true
    },
    ihc: {
        path: "ihc",
        label: "IHC",
        title: "IHC upload",
        assays: true
    },
    elisa: {
        path: "elisa",
        label: "ELISA",
        title: "ELISA upload",
        assays: true
    },
    mif: {
        path: "mif",
        label: "mIF",
        title: "mIF upload",
        assays: true
    },
    tcr: {
        path: "tcr",
        label: "TCR",
        title: "TCR upload",
        assays: true,
        analyses: true
    }
};

export interface IUploadDocsPageProps extends RouteComponentProps {
    uploadType: "assays" | "analyses";
}

const UploadDocsPage: React.FunctionComponent<IUploadDocsPageProps> = props => {
    const DocsListItem: React.FunctionComponent<{
        label: string;
        path: string;
    }> = localProps => (
        <ListItem
            button
            selected={props.location.pathname.endsWith(localProps.path)}
            onClick={() => props.history.push(localProps.path)}
        >
            <ListItemText>{localProps.label}</ListItemText>
        </ListItem>
    );

    const CLIInstructionsSitePath = `/${props.uploadType}/${CLIInstructionsPath}`;

    const CLIRedirect = () => <Redirect to={CLIInstructionsSitePath} />;

    const CLIUploadInstructions = () => {
        return (
            <UploadInstructions
                docPath={`${CLIInstructionsPath}.md`}
                title={"The CIDC Command-Line Interface"}
                tokenButton={true}
                uploadType={props.uploadType}
            />
        );
    };

    const SelectedUploadInstructions: React.FC<RouteComponentProps<{
        docPath: string;
    }>> = rprops => {
        const docPath = rprops.match.params.docPath;
        const isCLI = docPath.indexOf("cli") > -1;
        const notFound = pathConfigs[docPath] === undefined;

        if (isCLI) {
            return null;
        }
        if (notFound) {
            return <CLIRedirect />;
        }

        return (
            <UploadInstructions
                docPath={`/${props.uploadType}/${docPath}.md`}
                title={pathConfigs[docPath].title}
                uploadType={props.uploadType}
            />
        );
    };

    return (
        <PageWithSidebar
            sidebar={
                <Grid container>
                    <Grid item xs={11}>
                        <List>
                            <ListSubheader disableSticky>
                                General Overview
                            </ListSubheader>
                            <DocsListItem
                                label={"CLI Instructions"}
                                path={CLIInstructionsSitePath}
                            />
                            <ListSubheader disableSticky>
                                Assay-Specific Docs
                            </ListSubheader>
                            {map(pathConfigs, (config, path) => {
                                return (
                                    config[props.uploadType] && (
                                        <DocsListItem
                                            key={path}
                                            label={config.label}
                                            path={`/${props.uploadType}/${config.path}`}
                                        />
                                    )
                                );
                            })}
                        </List>
                    </Grid>
                    <Grid item>
                        <Divider orientation="vertical" />
                    </Grid>
                </Grid>
            }
        >
            <Route
                path={`/${props.uploadType}`}
                component={CLIRedirect}
                exact
            />
            <Route
                path={CLIInstructionsSitePath}
                component={CLIUploadInstructions}
            />
            <Route
                path={`/${props.uploadType}/:docPath`}
                component={SelectedUploadInstructions}
            />
        </PageWithSidebar>
    );
};

export const AssayDocsPage = withRouter(props => (
    <UploadDocsPage {...props} uploadType="assays" />
));

export const AnalysesDocsPage = withRouter(props => (
    <UploadDocsPage {...props} uploadType="analyses" />
));
