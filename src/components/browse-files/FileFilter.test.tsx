import { fireEvent, act } from "@testing-library/react";
import React from "react";
import {
    getNativeCheckbox,
    renderWithUserContext
} from "../../../test/helpers";
import { getFilterFacets } from "../../api/api";
import FileFilter, { IFacets } from "./FileFilter";
import { QueryParamProvider } from "use-query-params";
import history from "../identity/History";
import { Route, Router } from "react-router-dom";
jest.mock("../../api/api");

const facets: IFacets = {
    trial_ids: ["test-trial-1", "test-trial-2"],
    facets: {
        flatFacet: [
            {
                label: "subfacet 1",
                description: "description 1"
            },
            {
                label: "subfacet 2",
                description: "description 2"
            }
        ],
        nestedFacet: {
            nestedSubfacet: [
                {
                    label: "subsubfacet 1",
                    description: "subdescription 1"
                },
                {
                    label: "subsubfacet 2",
                    description: "subdescription 2"
                }
            ]
        }
    }
};

it("renders expected facets based on getFilterFacets", async () => {
    getFilterFacets.mockResolvedValue(facets);
    const { findByText, queryByText } = renderWithUserContext(<FileFilter />, {
        id: 1,
        role: "cidc-admin"
    });
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
    getFilterFacets.mockResolvedValue(facets);
    const { findByTestId, getByTestId, getByText } = renderWithUserContext(
        <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <FileFilter />
            </QueryParamProvider>
        </Router>,
        {
            id: 1,
            role: "cidc-admin"
        }
    );
    let trialCheckbox = getNativeCheckbox(await findByTestId(/test-trial-1/i));

    // select flat facet
    fireEvent.click(trialCheckbox);
    expect(history.location.search).toContain("test-trial-1");
    trialCheckbox = getNativeCheckbox(getByTestId(/test-trial-1/i));
    expect(trialCheckbox.checked).toBe(true);

    // de-select flat facet
    fireEvent.click(trialCheckbox);
    expect(history.location.search).not.toContain("test-trial-1");
    trialCheckbox = getNativeCheckbox(getByTestId(/test-trial-1/i));
    expect(trialCheckbox.checked).toBe(false);

    // open nested facet
    const openNestedFacets = getByTestId(/toggle open nestedSubfacet/i);
    fireEvent.click(openNestedFacets);

    // select subfacet
    const subfacetCheckbox1 = getNativeCheckbox(getByTestId(/subsubfacet 1/i));
    fireEvent.click(subfacetCheckbox1);
    expect(history.location.search).toContain(
        encodeURIComponent("nestedSubfacet|subsubfacet 1")
    );
    expect(subfacetCheckbox1.checked).toBe(true);

    // select nested facet parent
    const facetParent = getNativeCheckbox(getByTestId(/^nestedSubfacet/i));
    const subfacetCheckbox2 = getNativeCheckbox(getByTestId(/subsubfacet 2/i));
    expect(subfacetCheckbox2.checked).toBe(false);
    fireEvent.click(facetParent);
    expect(facetParent.checked).toBe(true);
    expect(subfacetCheckbox2.checked).toBe(true);

    // deselect subfacet
    fireEvent.click(subfacetCheckbox1);
    expect(history.location.search).not.toContain(
        encodeURIComponent("nestedSubfacet|subsubfacet 1")
    );
    expect(subfacetCheckbox1.checked).toBe(false);

    // use the "clear filters" button
    fireEvent.click(trialCheckbox);
    fireEvent.click(subfacetCheckbox1);
    expect(getNativeCheckbox(getByTestId(/test-trial-1/i)).checked).toBe(true);
    expect(subfacetCheckbox1.checked).toBe(true);
    fireEvent.click(getByText(/clear filters/i));
    expect(getNativeCheckbox(getByTestId(/test-trial-1/i)).checked).toBe(false);
    expect(subfacetCheckbox1.checked).toBe(false);
    expect(subfacetCheckbox2.checked).toBe(false);
    expect(facetParent.checked).toBe(false);
});
