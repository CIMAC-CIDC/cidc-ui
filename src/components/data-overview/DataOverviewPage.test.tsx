import React from "react";
import DataOverviewPage from "./DataOverviewPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { apiFetch } from "../../api/api";
import { cleanup } from "@testing-library/react-hooks";
jest.mock("../../api/api");

afterEach(() => {
    // the mocks below don't work without calling this
    // cleanup function (don't know the root cause yet,
    // but it's useSWR-related)
    cleanup();
});

it("displays data as expected", async () => {
    apiFetch.mockImplementation(async (url: string) => {
        switch (url) {
            case "/info/data_overview":
                return { num_bytes: 1e9 };
            case "/trial_metadata/summaries":
                return [
                    {
                        trial_id: "trial1",
                        file_size_bytes: 1e3,
                        "h&e": 11,
                        wes: 12
                    },
                    {
                        trial_id: "trial2",
                        file_size_bytes: 1e6,
                        "h&e": 21,
                        wes: 0
                    }
                ];
            default:
                throw Error("got unexpected URL " + url);
        }
    });

    const { findByText, queryByText } = renderAsRouteComponent(
        DataOverviewPage
    );

    // from per-trial data summaries
    expect(await findByText(/protocol id/i)).toBeInTheDocument();
    expect(queryByText(/trial1/i)).toBeInTheDocument();
    expect(queryByText(/trial2/i)).toBeInTheDocument();
    expect(queryByText(/h&e/i)).toBeInTheDocument();
    expect(queryByText(/wes/i)).toBeInTheDocument();
    expect(queryByText(/1 kb/i)).toBeInTheDocument();
    expect(queryByText(/1 mb/i)).toBeInTheDocument();
    expect(queryByText(/11/i)).toBeInTheDocument();
    expect(queryByText(/12/i)).toBeInTheDocument();
    expect(queryByText(/21/i)).toBeInTheDocument();
    expect(queryByText(/-/)).toBeInTheDocument();

    // from CIDC-wide data overview
    expect(queryByText(/1 gb/i)).toBeInTheDocument();
});

it("handles no data", async () => {
    apiFetch.mockResolvedValue([]);
    const { findByText } = renderAsRouteComponent(DataOverviewPage);
    expect(await findByText(/no data/i)).toBeInTheDocument();
});
