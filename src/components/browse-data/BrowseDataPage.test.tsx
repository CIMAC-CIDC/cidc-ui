import React from "react";
import { fireEvent } from "@testing-library/react";
import history from "../identity/History";
import BrowseDataPage from "./BrowseDataPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { getFiles, getFilterFacets, getTrials } from "../../api/api";

jest.mock("../../api/api", () => {
    const actualApi = jest.requireActual("../../api/api");
    return {
        __esModule: true,
        ...actualApi,
        getTrials: jest.fn(),
        getFiles: jest.fn(),
        getFilterFacets: jest.fn()
    };
});

test("trial view / file view toggle", async () => {
    getTrials.mockResolvedValue([]);
    getFiles.mockResolvedValue({ data: [], meta: { total: 0 } });
    getFilterFacets.mockResolvedValue({ trial_ids: [], facets: {} });

    const { findByText, queryByText, getByText } = renderAsRouteComponent(
        BrowseDataPage,
        {
            history
        }
    );
    const trialViewText = /loaded all results/i;
    const fileViewText = /no data found for these filters/i;

    // Trial view renders first by default
    expect(history.location.search).not.toContain("file_view=1");
    expect(await findByText(trialViewText)).toBeInTheDocument();
    expect(queryByText(fileViewText)).not.toBeInTheDocument();

    // Toggle view to file view
    fireEvent.click(getByText(/file view/i));
    expect(history.location.search).toContain("file_view=1");
    expect(await findByText(fileViewText)).toBeInTheDocument();
    expect(queryByText(trialViewText)).not.toBeInTheDocument();

    // Toggle view back to trial view
    fireEvent.click(getByText(/trial view/i));
    expect(history.location.search).not.toContain("file_view=1");
    expect(await findByText(trialViewText)).toBeInTheDocument();
    expect(queryByText(fileViewText)).not.toBeInTheDocument();
});
