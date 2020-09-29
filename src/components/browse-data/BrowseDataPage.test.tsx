import React from "react";
import { fireEvent } from "@testing-library/react";
import history from "../identity/History";
import BrowseDataPage from "./BrowseDataPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { getFiles, getFilterFacets, getTrials } from "../../api/api";
jest.mock("../../api/api");

test("trial view / file view toggle", () => {
    getTrials.mockResolvedValue([]);
    getFiles.mockResolvedValue({ data: [], meta: { total: 0 } });
    getFilterFacets.mockResolvedValue({ trial_ids: [], facets: {} });

    const { queryByText, getByText } = renderAsRouteComponent(BrowseDataPage, {
        history
    });
    const trialViewText = /browse trial overviews/i;
    const fileViewText = /select files for batch download/i;

    // Trial view renders first by default
    expect(history.location.search).not.toContain("file_view=1");
    expect(queryByText(trialViewText)).toBeInTheDocument();
    expect(queryByText(fileViewText)).not.toBeInTheDocument();

    // Toggle view to file view
    fireEvent.click(getByText(/file view/i));
    expect(history.location.search).toContain("file_view=1");
    expect(queryByText(fileViewText)).toBeInTheDocument();
    expect(queryByText(trialViewText)).not.toBeInTheDocument();

    // Toggle view back to trial view
    fireEvent.click(getByText(/trial view/i));
    expect(history.location.search).not.toContain("file_view=1");
    expect(queryByText(trialViewText)).toBeInTheDocument();
    expect(queryByText(fileViewText)).not.toBeInTheDocument();
});
