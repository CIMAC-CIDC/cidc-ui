import React from "react";
import { useRootStyles } from "../../rootStyles";
import {
    Grid,
    List,
    ListSubheader,
    ListItem,
    ListItemText,
    Divider
} from "@material-ui/core";
import {
    RouteComponentProps,
    withRouter,
    Route,
    Redirect
} from "react-router-dom";
import CIDCGithubMarkdown from "../generic/CIDCGithubMarkdown";

const pipelineMarkdowns = {
    wes: (
        <div role="document" id="wes-docs">
            <CIDCGithubMarkdown
                path={`cidc-ngs-pipeline-api/master/cidc_ngs_pipeline_api/wes/wes.md`}
            />
        </div>
    ),
    rna: (
        <div role="document" id="rna-docs">
            <CIDCGithubMarkdown
                path={`cidc-ngs-pipeline-api/master/cidc_ngs_pipeline_api/rna/rna.md`}
            />
        </div>
    ),
    tcr: (
        <div role="document" id="tcr-docs">
            <CIDCGithubMarkdown
                path={`cidc-ngs-pipeline-api/master/cidc_ngs_pipeline_api/tcr/tcr.md`}
            />
        </div>
    ),
    chips: (
        <div role="document" id="chips-docs">
            <CIDCGithubMarkdown
                path={`cidc-ngs-pipeline-api/master/cidc_ngs_pipeline_api/chips/chips.md`}
            />
        </div>
    )
};

const PipelinesPage: React.FC<RouteComponentProps> = props => {
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

    const classes = useRootStyles();
    return (
        <div className={classes.centeredPage}>
            <Grid container justify="center" direction="row" wrap="nowrap">
                <Grid item style={{ width: 200 }}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            Pipeline Docs
                        </ListSubheader>
                        <DocsListItem
                            label={"RIMA (RNA-seq IMmune Analysis)"}
                            path={`/pipelines/rna`}
                        />
                        <DocsListItem
                            label={"WES (Whole Exome Sequencing"}
                            path={`/pipelines/wes`}
                        />
                        <DocsListItem
                            label={"TCR (T-cell Receptor Repertoire Analysis)"}
                            path={`/pipelines/tcr`}
                        />
                        <DocsListItem
                            label={"CHIPS ATAC-seq Analysis"}
                            path={`/pipelines/chips`}
                        />
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Route
                            path={`/pipelines/:docPath`}
                            render={({ match }) =>
                                pipelineMarkdowns[match.params.docPath] ||
                                pipelineMarkdowns.rna
                            }
                        />
                        <Route
                            path="/pipelines"
                            exact
                            render={() => <Redirect to="pipelines/rna" />}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default withRouter(PipelinesPage);
