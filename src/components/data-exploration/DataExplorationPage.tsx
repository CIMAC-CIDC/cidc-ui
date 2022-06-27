import { Button, ButtonGroup } from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BooleanParam, useQueryParam } from "use-query-params";
import InteractiveExplorationPage from "./interactive/InteractiveExploration";
import CodeBasedExplorationPage from "./code-based/CodeBasedExploration";

const DataExplorationPage: React.FC<RouteComponentProps> = props => {
    const [showCodeView, setShowCodeView] = useQueryParam(
        "code_view",
        BooleanParam
    );

    const viewToggleButton = (
        <ButtonGroup size="small" color="primary" disableElevation>
            <Button
                variant={showCodeView ? "outlined" : "contained"}
                onClick={() => setShowCodeView(false)}
            >
                interactive view
            </Button>
            <Button
                variant={showCodeView ? "contained" : "outlined"}
                onClick={() => setShowCodeView(true)}
            >
                code-based view
            </Button>
        </ButtonGroup>
    );

    return showCodeView ? (
        <CodeBasedExplorationPage
            history={props.history}
            viewToggleButton={viewToggleButton}
        />
    ) : (
        <InteractiveExplorationPage viewToggleButton={viewToggleButton} />
    );
};

export default DataExplorationPage;
