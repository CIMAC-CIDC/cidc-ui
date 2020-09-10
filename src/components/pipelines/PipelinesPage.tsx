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
                path={`cidc-ngs-pipeline-api/master/wes/wes.md`}
            />
        </div>
    ),
    rna_level1: (
        <div role="document" id="rna-docs">
            <CIDCGithubMarkdown
                path={`cidc-ngs-pipeline-api/master/rna/rna_level1.md`}
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
            <Grid container direction="row">
                <Grid item style={{ width: 200 }}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            Pipeline Docs
                        </ListSubheader>
                        <DocsListItem
                            label={"RIMA (RNA-seq IMmune Analysis)"}
                            path={`/pipelines/rna_level1`}
                        />
                        <DocsListItem label={"WES"} path={`/pipelines/wes`} />
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Redirect
                            from="/pipelines"
                            to="/pipelines/rna_level1"
                        />
                        <Route
                            path={`/pipelines/:docPath`}
                            render={({ match }) =>
                                pipelineMarkdowns[match.params.docPath]
                            }
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default withRouter(PipelinesPage);
