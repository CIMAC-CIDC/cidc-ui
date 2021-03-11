import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { range } from "lodash";
import { renderWithRouter } from "../../../../test/helpers";
import { apiFetch } from "../../../api/api";
import { AuthContext } from "../../identity/AuthProvider";
import { FilterContext } from "../shared/FilterProvider";
import TrialTable, { TrialCard, usePaginatedTrials } from "./TrialTable";
import { renderHook } from "@testing-library/react-hooks";
import { useUserContext } from "../../identity/UserProvider";

jest.mock("../../../api/api");
jest.mock("../../identity/UserProvider");

beforeEach(() => {
    useUserContext.mockImplementation(() => ({ canDownload: true }));
});

const fileBundle = {
    IHC: {
        source: [1, 2]
    },
    CyTOF: {
        source: [4, 5, 6],
        analysis: [1, 2, 3, 4]
    },
    "Participants Info": {
        miscellaneous: [10]
    },
    "Samples Info": {
        clinical: [12]
    },
    other: {
        source: [1, 2, 3]
    }
};
const metadata = {
    nct_id: "NCT11111111",
    trial_name: "a fancy trial name",
    trial_status: "Ongoing",
    lead_cimac_pis: ["a", "b", "c"],
    biobank: "nice biobank",
    participants: [
        { samples: range(5) },
        { samples: range(7) },
        { samples: range(2) }
    ]
};

const total = 15;
const trialsPageOne = {
    _items: range(10).map(id => ({
        id,
        trial_id: `test-trial-${id}`,
        metadata_json: metadata,
        file_bundle: fileBundle
    })),
    _meta: { total }
};
const trialsPageTwo = {
    _items: range(10, total).map(id => ({
        id,
        trial_id: `test-trial-${id}`,
        metadata_json: metadata,
        file_bundle: fileBundle
    })),
    _meta: { total }
};

const toggleButtonText = "toggle file view";
const renderTrialTable = () => {
    return renderWithRouter(
        <AuthContext.Provider value={{ idToken: "test-token" }}>
            <TrialTable
                viewToggleButton={<button>{toggleButtonText}</button>}
            />
        </AuthContext.Provider>
    );
};

it("renders trials with no filters applied", async () => {
    apiFetch.mockResolvedValue(trialsPageOne);
    const {
        findByText,
        queryAllByTestId,
        queryByText,
        queryAllByText
    } = renderTrialTable();
    expect(queryByText(new RegExp(toggleButtonText, "i"))).toBeInTheDocument();
    expect(queryAllByTestId(/placeholder-card/i).length).toBeGreaterThan(0);

    // renders all trial cards
    expect(await findByText(/test-trial-0/i)).toBeInTheDocument();
    range(1, 10).forEach(i => {
        expect(
            queryByText(new RegExp(`test-trial-${i}`, "i"))
        ).toBeInTheDocument();
    });

    // renders trial info
    expect(queryAllByText(new RegExp(metadata.nct_id, "i")).length).toBe(10);
    expect(queryAllByText(new RegExp(metadata.trial_name, "i")).length).toBe(
        10
    );
    expect(queryAllByText(new RegExp(metadata.trial_status, "i")).length).toBe(
        10
    );
    expect(queryAllByText(new RegExp("a, b, c", "i")).length).toBe(10);
    expect(queryAllByText(new RegExp("nice biobank", "i")).length).toBe(10);

    // renders batch download interface
    const clinicalButtons = queryAllByText(/2 participant\/sample files/i);
    const fourFileButtons = queryAllByText(/4 files/i);
    const zeroFileButtons = queryAllByText(/0 files/i);
    expect(clinicalButtons.length).toBe(10);
    expect(queryAllByText(/cytof/i).length).toBe(10);
    expect(fourFileButtons.length).toBe(10);
    expect(queryAllByText(/3 files/i).length).toBe(10);
    expect(queryAllByText(/ihc/i).length).toBe(10);
    expect(queryAllByText(/2 files/i).length).toBe(10);
    expect(zeroFileButtons.length).toBe(10);

    // buttons with files available are enabled
    expect(clinicalButtons[0].closest("button").disabled).toBe(false);
    expect(fourFileButtons[0].closest("button").disabled).toBe(false);
    expect(zeroFileButtons[0].closest("button").disabled).toBe(true);
});

it("doesn't enable download buttons if users don't have download permission", async () => {
    apiFetch.mockResolvedValue(trialsPageOne);
    useUserContext.mockImplementation(() => ({ canDownload: false }));
    const { findByText, queryAllByText } = renderTrialTable();

    expect(await findByText(/test-trial-0/i)).toBeInTheDocument();
    const clinicalButtons = queryAllByText(/2 participant\/sample files/i);
    const fourFileButtons = queryAllByText(/4 files/i);
    const zeroFileButtons = queryAllByText(/0 files/i);

    // All download buttons are disabled
    expect(clinicalButtons[0].closest("button").disabled).toBe(true);
    expect(fourFileButtons[0].closest("button").disabled).toBe(true);
    expect(zeroFileButtons[0].closest("button").disabled).toBe(true);
});

it("handles pagination as expected", async () => {
    apiFetch.mockResolvedValue(trialsPageOne);
    const {
        findByText,
        queryByText,
        queryAllByText,
        getByText
    } = renderTrialTable();

    // first page
    await findByText(/test-trial-0/i);
    range(10).forEach(i => {
        expect(
            queryByText(new RegExp(`test-trial-${i}$`, "i"))
        ).toBeInTheDocument();
    });
    expect(queryAllByText(/test-trial/i).length).toBe(10);

    // second page
    apiFetch.mockResolvedValue(trialsPageTwo);
    const loadMoreButton = getByText(/load more trials/i);
    fireEvent.click(loadMoreButton);
    await findByText(/test-trial-10/i);
    range(15).forEach(i => {
        expect(
            queryByText(new RegExp(`test-trial-${i}$`, "i"))
        ).toBeInTheDocument();
    });
    expect(queryAllByText(/test-trial/i).length).toBe(15);
    expect(queryByText(/loaded all results/i)).toBeInTheDocument();
    expect(loadMoreButton.closest("button")).toBeDisabled();
});

it("filters by trial id", async () => {
    apiFetch.mockImplementation(async url => {
        expect(url).toContain("trial_ids=test-trial-0,test-trial-1");
        return { ...trialsPageOne, _items: trialsPageOne._items.slice(0, 2) };
    });
    const { findByText, queryByText } = renderWithRouter(
        <AuthContext.Provider value={{ idToken: "test-token" }}>
            <FilterContext.Provider
                value={{
                    filters: { trial_ids: ["test-trial-0", "test-trial-1"] }
                }}
            >
                <TrialTable
                    viewToggleButton={<button>{toggleButtonText}</button>}
                />
            </FilterContext.Provider>
        </AuthContext.Provider>
    );
    expect(await findByText(/test-trial-0/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-1/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-2/i)).not.toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalled();
});

test("TrialCard links out to clinicaltrials.gov", () => {
    const { getByText } = render(
        // @ts-ignore
        <TrialCard token="foo" trial={trialsPageOne._items[0]} />
    );
    const nctLink = getByText(new RegExp(metadata.nct_id, "i")).closest("a");
    expect(nctLink.href).toBe(
        "https://clinicaltrials.gov/ct2/show/NCT11111111"
    );
});

test("usePaginatedTrials appears not to have a race condition", async () => {
    apiFetch
        .mockImplementationOnce(async () => {
            await new Promise(r => setTimeout(r, 1000));
            return trialsPageOne;
        })
        .mockImplementationOnce(async () => {
            await new Promise(r => setTimeout(r, 50));
            return {
                ...trialsPageOne,
                _items: trialsPageOne._items.slice(0, 2)
            };
        })
        .mockImplementationOnce(async () => {
            await new Promise(r => setTimeout(r, 100));
            return {
                ...trialsPageOne,
                _items: trialsPageOne._items.slice(3, 6)
            };
        })
        .mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 300));
            return {
                ...trialsPageOne,
                _items: trialsPageOne._items.slice(7, 9)
            };
        });

    const wrapper: React.FC<any> = ({ children, filters }) => (
        <FilterContext.Provider value={{ filters }}>
            {children}
        </FilterContext.Provider>
    );
    const { rerender, result, waitFor } = renderHook(
        () => usePaginatedTrials("token"),
        {
            wrapper,
            initialProps: { filters: { trial_ids: [] } }
        }
    );
    // The actual filter values don't matter here, because the API responses
    // are mocked to return values independent of these filters. What matters
    // is that the filters change between each render.
    rerender({ filters: { trial_ids: ["test-trial-0"] } });
    rerender({ filters: { trial_ids: ["test-trial-1"] } });
    rerender({ filters: { trial_ids: ["test-trial-2"] } });

    await waitFor(() => {
        const lastURL = apiFetch.mock.calls[apiFetch.mock.calls.length - 1][0];
        expect(lastURL).toContain("test-trial-2");
        expect(result.current.trials).toEqual(trialsPageOne._items.slice(7, 9));
    });
});
