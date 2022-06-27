import * as React from "react";
import {
    List,
    Grid,
    ListItem,
    ListItemText,
    Divider,
    ListSubheader,
    Box,
    Typography
} from "@material-ui/core";
import { map } from "lodash";
import { RouteComponentProps, Route, withRouter, Redirect } from "react-router";
import UploadInstructions from "./UploadInstructions";
import { Dictionary } from "lodash";
import PageWithSidebar from "../generic/PageWithSidebar";
import { Alert } from "@material-ui/lab";
import MuiRouterLink from "../generic/MuiRouterLink";
import { widths } from "../../rootStyles";

interface IDocPathConfig {
    path: string;
    label: string;
    title: string;
    analyses?: boolean;
}

const CLIInstructionsPath = "cli-instructions";

const pathConfigs: Dictionary<IDocPathConfig> = {
    wes: {
        path: "wes",
        label: "WES",
        title: "WES upload",
        analyses: true
    },
    atac: {
        path: "atac",
        label: "ATAC",
        title: "ATAC upload",
        analyses: true
    },
    rna: {
        path: "rna",
        label: "RNA Expression",
        title: "RNA Expression upload",
        analyses: true
    },
    cytof: {
        path: "cytof",
        label: "CyTOF",
        title: "CyTOF upload",
        analyses: true
    },
    tcr: {
        path: "tcr",
        label: "TCR",
        title: "TCR upload",
        analyses: true
    }
};

export interface IUploadDocsPageProps extends RouteComponentProps {
    uploadType: "analyses";
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
        <>
            <Box width={widths.minPageWidth} m="auto" pb={3}>
                <Alert severity="info">
                    <Typography>
                        The CIDC is rolling out a new, simpler upload process,
                        with no custom CLI required. Check out the{" "}
                        <MuiRouterLink to="/transfer-data">
                            Transfer Data
                        </MuiRouterLink>{" "}
                        page.
                    </Typography>
                    <Typography>
                        If you prefer to use the CIDC's CLI for uploads, it is
                        still supported, but we recommend using the new upload
                        process instead.
                    </Typography>
                </Alert>
            </Box>
            <PageWithSidebar
                sidebar={
                    <Grid container>
                        <Grid item xs={11}>
                            <List>
                                <DocsListItem
                                    label={"The CIDC CLI"}
                                    path={CLIInstructionsSitePath}
                                />
                                <ListSubheader disableSticky>
                                    {props.uploadType[0].toUpperCase() +
                                        props.uploadType.slice(1)}
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
        </>
    );
};

export const AnalysesDocsPage = withRouter(props => (
    <UploadDocsPage {...props} uploadType="analyses" />
));
