import React from "react";
import DataOverviewPage from "./DataOverviewPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { apiFetch } from "../../api/api";
import { cleanup } from "@testing-library/react-hooks";
import { createMuiTheme } from "@material-ui/core";
import { fireEvent, within } from "@testing-library/dom";
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
    const excluded = { cimac_id: "CTTTPP01", reason_excluded: "some reason" };
    apiFetch.mockImplementation(async (url: string) => {
        switch (url) {
            case "/info/data_overview":
                return { num_bytes: 1e9 };
            case "/downloadable_files/facet_groups_for_links":
                return {
                    facets: {
                        clinical_participants: {
                            received: ["clinical_participants"],
                            analyzed: [] // none
                        },
                        atacseq: {
                            // test multiple values as well as space
                            received: ["atacseq_assay", "atacseq assay"],
                            analyzed: ["atacseq_analysis"]
                        },
                        cytof: {
                            received: ["cytof_assay"],
                            analyzed: ["cytof_analysis"]
                        },
                        elisa: { received: ["elisa_assay"] },
                        // test special character
                        "h&e": { received: ["h&e_assay"] },
                        ihc: { received: ["ihc_assay"] },
                        mif: { received: ["mif_assay"] },
                        nanostring: { received: ["mif_assay"] },
                        olink: { received: ["olink_assay"] },
                        rna: {
                            received: ["rna_assay"],
                            analyzed: ["rna_analysis"]
                        },
                        tcr: {
                            received: ["tcr_assay"],
                            analyzed: ["tcr_analysis"]
                        },
                        wes: {
                            received: ["wes_assay"],
                            analyzed: ["wes_analysis"]
                        },
                        wes_tumor_only: {
                            received: ["wes_assay"],
                            analyzed: ["wes_tumor_only_analysis"]
                        }
                    }
                };
            case "/trial_metadata/summaries":
                return [
                    {
                        trial_id: "tr1",
                        file_size_bytes: 1e3,
                        clinical_participants: 1,
                        total_participants: 2,
                        expected_assays: ["atacseq", "wes", "h&e", "ihc"],
                        "h&e": 11,
                        atacseq: 3,
                        wes: 5,
                        wes_analysis: 5,
                        wes_tumor_only: 6,
                        wes_tumor_only_analysis: 1,
                        ihc: 0,
                        excluded_samples: {
                            wes_tumor_only_analysis: [excluded]
                        }
                    },
                    {
                        trial_id: "tr2",
                        file_size_bytes: 1e6,
                        clinical_participants: 0,
                        total_participants: 3,
                        expected_assays: ["atacseq", "h&e", "ihc"],
                        "h&e": 21,
                        atacseq: 0,
                        wes: 0,
                        wes_tumor_only: 0,
                        ihc: 22
                    }
                ];
            default:
                throw Error("got unexpected URL " + url);
        }
    });

    const {
        findByText,
        queryByText,
        getByTestId,
        queryAllByText
    } = renderAsRouteComponent(DataOverviewPage);

    // from per-trial data summaries
    expect(await findByText(/trial/i)).toBeInTheDocument();
    expect(queryByText(/tr1/i)).toBeInTheDocument();
    expect(queryByText(/tr2/i)).toBeInTheDocument();
    expect(queryByText(/h&e/i)).toBeInTheDocument();
    expect(queryAllByText(/wes/i).length).toEqual(2);
    expect(queryByText(/wes_tumor_only/i)).toBeInTheDocument();
    expect(queryByText(/1 kb/i)).toBeInTheDocument();
    expect(queryByText(/1 mb/i)).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr1-h&e-received"), "11")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr1-atacseq-received"), "3")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr1-wes_tumor_only-received"), "6")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr1-wes-received"), "5")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr1-ihc-received"), "0")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr2-h&e-received"), "21")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("data-tr2-ihc-received"), "22")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("na-tr2-wes_tumor_only-received"), "-")
    ).toBeInTheDocument();
    expect(
        innerText(getByTestId("na-tr2-wes-received"), "-")
    ).toBeInTheDocument();

    const wesTumorOnlyAnalyzed = getByTestId(
        "data-tr1-wes_tumor_only-analyzed"
    );
    expect(innerText(wesTumorOnlyAnalyzed, "1")).toBeInTheDocument();
    expect(wesTumorOnlyAnalyzed.children[0]).toHaveStyle(
        `background: ${theme.palette.warning.light}`
    );
    const wesAnalyzed = getByTestId("data-tr1-wes-analyzed");
    expect(innerText(wesAnalyzed, "5")).toBeInTheDocument();
    expect(wesAnalyzed.children[0]).toHaveStyle(
        `background: ${theme.palette.success.light}`
    );

    // links to file browser
    expect(getByTestId("chip-tr1-atacseq-received")).toHaveAttribute(
        "href",
        "/browse-data?file_view=1&trial_ids=tr1&facets=atacseq_assay&facets=atacseq%20assay"
    );
    // wes_tumor and wes assay point to the same place
    expect(getByTestId("chip-tr1-wes-received")).toHaveAttribute(
        "href",
        "/browse-data?file_view=1&trial_ids=tr1&facets=wes_assay"
    );
    expect(getByTestId("chip-tr1-wes_tumor_only-received")).toHaveAttribute(
        "href",
        "/browse-data?file_view=1&trial_ids=tr1&facets=wes_assay"
    );

    // sample exclusions are displayed on hover
    fireEvent.mouseOver(wesTumorOnlyAnalyzed.firstElementChild!);
    expect(await findByText(excluded.cimac_id)).toBeInTheDocument();
    expect(
        queryByText(new RegExp(excluded.reason_excluded, "i"))
    ).toBeInTheDocument();

    // clinical data is displayed (and colored) as expected
    expect(queryByText(/0 \/ 3 participants/i)).toBeInTheDocument();
    expect(getByTestId("chip-tr1-clinical_participants")).toHaveStyle(
        `color: ${theme.palette.primary.main}`
    ); // blue
    expect(queryByText(/0 \/ 3 participants/i)).toBeInTheDocument();
    expect(getByTestId("chip-tr2-clinical_participants")).toHaveStyle(
        `color: ${theme.palette.text.primary}`
    ); // grey

    // clinical data links generated as expected
    expect(getByTestId("chip-tr1-clinical_participants")).toHaveAttribute(
        "href",
        "/browse-data?file_view=1&trial_ids=tr1&facets=clinical_participants"
    );
    expect(getByTestId("chip-tr2-clinical_participants")).toHaveAttribute(
        "href",
        "/browse-data?file_view=1&trial_ids=tr2&facets=clinical_participants"
    );

    // from CIDC-wide data overview
    expect(queryByText(/1 gb/i)).toBeInTheDocument();
});

it("handles no data", async () => {
    apiFetch.mockResolvedValue([]);
    const { findByText } = renderAsRouteComponent(DataOverviewPage);
    expect(await findByText(/no data/i)).toBeInTheDocument();
});
