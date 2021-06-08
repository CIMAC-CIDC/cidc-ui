import React from "react";
import DataOverviewPage from "./DataOverviewPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { apiFetch } from "../../api/api";
import { cleanup } from "@testing-library/react-hooks";
import { createMuiTheme } from "@material-ui/core";
import { within } from "@testing-library/dom";
jest.mock("../../api/api");

const theme = createMuiTheme();

afterEach(() => {
    // the mocks below don't work without calling this
    // cleanup function (don't know the root cause yet,
    // but it's useSWR-related)
    cleanup();
});

const innerText = (elem: HTMLElement, text: string) =>
    within(elem).queryByText(text);

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
                        clinical_participants: 1,
                        total_participants: 2,
                        expected_assays: ["wes", "h&e", "ihc"],
                        "h&e": 11,
                        wes: 12,
                        wes_analysis: 11,
                        ihc: 0
                    },
                    {
                        trial_id: "trial2",
                        file_size_bytes: 1e6,
                        clinical_participants: 0,
                        total_participants: 3,
                        expected_assays: ["h&e", "ihc"],
                        "h&e": 21,
                        wes: 0,
                        ihc: 22
                    }
                ];
            default:
                throw Error("got unexpected URL " + url);
        }
    });

    const { findByText, queryByText, getByTestId } = renderAsRouteComponent(
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
    expect(
        innerText(getByTestId("data-trial1-h&e-received"), "11")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-trial1-wes-received"), "12")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-trial1-wes-analyzed"), "11")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-trial1-ihc-received"), "0")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-trial2-h&e-received"), "21")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-trial2-ihc-received"), "22")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("na-trial2-wes-received"), "-")
    ).toBeInTheDocument();

    // clinical data is displayed (and colored) as expected
    const partialClinical = queryByText(/1 \/ 2 participants/i);
    expect(partialClinical).toBeInTheDocument();
    expect(partialClinical?.closest("div")).toHaveStyle(
        `color: ${theme.palette.primary.main}`
    ); // blue
    const fullClinical = queryByText(/0 \/ 3 participants/i);
    expect(fullClinical).toBeInTheDocument();
    expect(fullClinical?.closest("div")).toHaveStyle(
        `color: ${theme.palette.text.primary}`
    ); // grey

    // from CIDC-wide data overview
    expect(queryByText(/1 gb/i)).toBeInTheDocument();
});

it("handles no data", async () => {
    apiFetch.mockResolvedValue([]);
    const { findByText } = renderAsRouteComponent(DataOverviewPage);
    expect(await findByText(/no data/i)).toBeInTheDocument();
});
