import { Button, ButtonGroup } from "@material-ui/core";
import * as React from "react";
import Filters from "./shared/Filters";
import FileTable from "./files/FileTable";
import { RouteComponentProps } from "react-router";
import TrialTable from "./trials/TrialTable";
import FilterProvider from "./shared/FilterProvider";
import { BooleanParam, useQueryParam } from "use-query-params";
import PageWithSidebar from "../generic/PageWithSidebar";

const BrowseDataPage: React.FC<RouteComponentProps> = props => {
    const [showFileView, setShowFileView] = useQueryParam(
        "file_view",
        BooleanParam
    );

    const viewToggleButton = (
        <ButtonGroup size="small" color="primary" disableElevation>
            <Button
                variant={showFileView ? "outlined" : "contained"}
                onClick={() => setShowFileView(false)}
            >
                trial view
            </Button>
            <Button
                variant={showFileView ? "contained" : "outlined"}
                onClick={() => setShowFileView(true)}
            >
                file view
            </Button>
        </ButtonGroup>
    );

    return (
        <FilterProvider trialView={!showFileView}>
            <PageWithSidebar sidebar={<Filters />}>
                {showFileView ? (
                    <FileTable
                        history={props.history}
                        viewToggleButton={viewToggleButton}
                    />
                ) : (
                    <TrialTable viewToggleButton={viewToggleButton} />
                )}
            </PageWithSidebar>
        </FilterProvider>
    );
};

export default BrowseDataPage;
