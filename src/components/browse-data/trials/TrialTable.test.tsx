import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { range } from "lodash";
import { renderWithRouter } from "../../../../test/helpers";
import { getTrials } from "../../../api/api";
import { AuthContext } from "../../identity/AuthProvider";
import { FilterContext, IFilterContext } from "../shared/FilterProvider";
import TrialTable, { TrialCard, usePaginatedTrials } from "./TrialTable";
import { act, renderHook } from "@testing-library/react-hooks";
import { CancelToken } from "axios";

jest.mock("../../../api/api", () => {
    const actualApi = jest.requireActual("../../../api/api");
    return {
        __esModule: true,
        ...actualApi,
        getTrials: jest.fn()
    };
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

const trialsPageOne = range(10).map(id => ({
    id,
    trial_id: `test-trial-${id}`,
    metadata_json: metadata,
    file_bundle: fileBundle
}));
const trialsPageTwo = range(10, 15).map(id => ({
    id,
    trial_id: `test-trial-${id}`,
    metadata_json: metadata,
    file_bundle: fileBundle
}));

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
    getTrials.mockResolvedValue(trialsPageOne);
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
    expect(queryAllByText(/2 participant\/sample files/i).length).toBe(10);
    expect(queryAllByText(/cytof/i).length).toBe(10);
    expect(queryAllByText(/4 files/i).length).toBe(10);
    expect(queryAllByText(/3 files/i).length).toBe(10);
    expect(queryAllByText(/ihc/i).length).toBe(10);
    expect(queryAllByText(/2 files/i).length).toBe(10);
    expect(queryAllByText(/0 files/i).length).toBe(10);
});

it("handles pagination as expected", async () => {
    getTrials.mockResolvedValue(trialsPageOne);
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
    getTrials.mockResolvedValue(trialsPageTwo);
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
    getTrials.mockImplementation((token: string, params: any) => {
        expect(params.trial_ids).toBe("test-trial-0,test-trial-1");
        return Promise.resolve(trialsPageOne.slice(0, 2));
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
    expect(getTrials).toHaveBeenCalled();
});

test("TrialCard links out to clinicaltrials.gov", () => {
    const { getByText } = render(
        // @ts-ignore
        <TrialCard token="foo" trial={trialsPageOne[0]} />
    );
    const nctLink = getByText(new RegExp(metadata.nct_id, "i")).closest("a");
    expect(nctLink.href).toBe(
        "https://clinicaltrials.gov/ct2/show/NCT11111111"
    );
});

test("usePaginatedTrials appears not to have a race condition", async () => {
    getTrials
        .mockImplementationOnce(async (t, p, cancelToken: CancelToken) => {
            await new Promise(r => setTimeout(r, 1000));
            cancelToken.throwIfRequested();
            return trialsPageOne;
        })
        .mockImplementationOnce(async (t, p, cancelToken: CancelToken) => {
            await new Promise(r => setTimeout(r, 50));
            cancelToken.throwIfRequested();
            return trialsPageOne.slice(0, 2);
        })
        .mockImplementationOnce(async (t, p, cancelToken: CancelToken) => {
            await new Promise(r => setTimeout(r, 100));
            cancelToken.throwIfRequested();
            return trialsPageOne.slice(3, 6);
        })
        .mockImplementation(async (t, p, cancelToken: CancelToken) => {
            await new Promise(r => setTimeout(r, 300));
            cancelToken.throwIfRequested();
            return trialsPageOne.slice(7, 9);
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
        expect(getTrials.mock.calls.length).toBeGreaterThan(3);
        expect(result.current.allLoaded).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.trials).toEqual(trialsPageOne.slice(7, 9));
});
