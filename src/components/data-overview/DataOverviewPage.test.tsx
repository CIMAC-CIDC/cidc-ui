import React from "react";
import DataOverviewPage from "./DataOverviewPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { apiFetch } from "../../api/api";
jest.mock("../../api/api");

it("displays data as expected", async () => {
    apiFetch.mockResolvedValue([
        { trial_id: "trial1", file_size_bytes: 1e3, assay_1: 11, assay_2: 12 },
        { trial_id: "trial2", file_size_bytes: 1e6, assay_1: 21, assay_2: 0 }
    ]);

    const { findByText, queryByText } = renderAsRouteComponent(
        DataOverviewPage
    );

    expect(await findByText(/protocol id/i)).toBeInTheDocument();
    expect(queryByText(/trial1/i)).toBeInTheDocument();
    expect(queryByText(/trial2/i)).toBeInTheDocument();
    expect(queryByText(/1 kb/i)).toBeInTheDocument();
    expect(queryByText(/1 mb/i)).toBeInTheDocument();
    expect(queryByText(/11/i)).toBeInTheDocument();
    expect(queryByText(/12/i)).toBeInTheDocument();
    expect(queryByText(/21/i)).toBeInTheDocument();
    expect(queryByText(/-/)).toBeInTheDocument();
});

it("handles no data", async () => {
    apiFetch.mockResolvedValue([]);
    const { findByText } = renderAsRouteComponent(DataOverviewPage);
    expect(await findByText(/no data/i)).toBeInTheDocument();
});
