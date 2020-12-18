import { fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";
import {
    getNativeCheckbox,
    renderWithUserContext
} from "../../../../test/helpers";
import { apiFetch } from "../../../api/api";
import Filters from "./Filters";
import { QueryParamProvider } from "use-query-params";
import history from "../../identity/History";
import { Route, Router } from "react-router-dom";
import FilterProvider, { IFacets } from "./FilterProvider";
jest.mock("../../../api/api");

const facets: IFacets = {
    trial_ids: [
        { label: "test-trial-1", count: 0 },
        { label: "test-trial-2", count: 1 }
    ],
    facets: {
        flatFacet: [
            {
                label: "subfacet 1",
                description: "description 1",
                count: 0
            },
            {
                label: "subfacet 2",
                description: "description 2",
                count: 1
            }
        ],
        nestedFacet: {
            nestedSubfacet: [
                {
                    label: "subsubfacet 1",
                    description: "subdescription 1",
                    count: 0
                },
                {
                    label: "subsubfacet 2",
                    description: "subdescription 2",
                    count: 1
                },
                {
                    label: "subsubfacet 3",
                    description: "description 3",
                    count: 2
                }
            ]
        }
    }
};

beforeEach(() => {
    apiFetch.mockResolvedValue(facets);
});

it("renders expected facets based on getFilterFacets", async () => {
    const { findByText, queryByText } = renderWithUserContext(
        <FilterProvider>
            <Filters />
        </FilterProvider>,
        {
            id: 1,
            role: "cidc-admin"
        }
    );
    expect(await findByText(/protocol id/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-1/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-2/i)).toBeInTheDocument();
    expect(queryByText(/flatFacet/i)).toBeInTheDocument();
    expect(queryByText(/subfacet 1/i)).toBeInTheDocument();
    expect(queryByText(/nestedFacet/i)).toBeInTheDocument();
    expect(queryByText(/nestedSubfacet/i)).toBeInTheDocument();
    expect(queryByText(/subsubfacet 1/i)).not.toBeInTheDocument();
});

it("handles checkbox selection as expected", async () => {
    const { findByTestId, getByTestId, getByText } = renderWithUserContext(
        <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <FilterProvider>
                    <Filters />
                </FilterProvider>
            </QueryParamProvider>
        </Router>,
        {
            id: 1,
            role: "cidc-admin"
        }
    );

    // flat facet with 0 count is disabled
    const disabledTrialCheckbox = getNativeCheckbox(
        await findByTestId(/test-trial-1/i)
    );
    expect(disabledTrialCheckbox.disabled).toBe(true);

    // selecting a flat facet with >0 count works as expected
    let trialCheckbox = getNativeCheckbox(getByTestId(/test-trial-2/i));
    fireEvent.click(trialCheckbox);
    await waitFor(() =>
        expect(history.location.search).toContain("test-trial-2")
    );
    trialCheckbox = getNativeCheckbox(getByTestId(/test-trial-2/i));
    expect(trialCheckbox.checked).toBe(true);

    // de-select flat facet
    fireEvent.click(trialCheckbox);
    await waitFor(() =>
        expect(history.location.search).not.toContain("test-trial-2")
    );
    trialCheckbox = getNativeCheckbox(getByTestId(/test-trial-2/i));
    expect(trialCheckbox.checked).toBe(false);

    // open nested facet
    const openNestedFacets = getByTestId(/toggle open nestedSubfacet/i);
    fireEvent.click(openNestedFacets);

    // nested facet with 0 count is disabled
    const subfacetCheckbox1 = getNativeCheckbox(getByTestId(/subsubfacet 1/i));
    expect(subfacetCheckbox1.disabled).toBe(true);

    // select subfacet
    const subfacetCheckbox2 = getNativeCheckbox(getByTestId(/subsubfacet 2/i));
    fireEvent.click(subfacetCheckbox2);
    await waitFor(() =>
        expect(history.location.search).toContain(
            encodeURIComponent("nestedSubfacet|subsubfacet 2")
        )
    );
    expect(subfacetCheckbox2.checked).toBe(true);

    // select nested facet parent
    const facetParent = getNativeCheckbox(getByTestId(/^nestedSubfacet/i));
    const subfacetCheckbox3 = getNativeCheckbox(getByTestId(/subsubfacet 3/i));
    expect(subfacetCheckbox3.checked).toBe(false);
    fireEvent.click(facetParent);
    await waitFor(() => expect(facetParent.checked).toBe(true));
    expect(subfacetCheckbox3.checked).toBe(true);

    // deselect subfacet
    fireEvent.click(subfacetCheckbox2);
    await waitFor(() =>
        expect(history.location.search).not.toContain(
            encodeURIComponent("nestedSubfacet|subsubfacet 2")
        )
    );
    expect(subfacetCheckbox2.checked).toBe(false);

    // use the "clear filters" button
    fireEvent.click(getNativeCheckbox(getByTestId(/test-trial-2/i)));
    await waitFor(() =>
        expect(getNativeCheckbox(getByTestId(/test-trial-2/i)).checked).toBe(
            true
        )
    );
    fireEvent.click(subfacetCheckbox2);
    await waitFor(() => expect(subfacetCheckbox2.checked).toBe(true));
    fireEvent.click(getByText(/clear filters/i));
    await waitFor(() => {
        expect(getNativeCheckbox(getByTestId(/test-trial-2/i)).checked).toBe(
            false
        );
        expect(subfacetCheckbox2.checked).toBe(false);
        expect(subfacetCheckbox3.checked).toBe(false);
        expect(facetParent.checked).toBe(false);
    });
});
