import React from "react";
import HomePage from "./HomePage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { apiFetch, IDataOverview } from "../../api/api";
import history from "../identity/History";
import { fireEvent } from "@testing-library/react";
import { UserContext } from "../identity/UserProvider";
jest.mock("../../api/api");

const dataOverview: IDataOverview = {
    num_trials: "trials-count",
    num_participants: "participants-count",
    num_samples: "samples-count",
    num_assays: "assays-count",
    num_files: "files-count",
    num_bytes: 1
};

beforeEach(() => {
    apiFetch.mockResolvedValue(dataOverview);
});

const waitForLoadComplete = async (findByText: any) => {
    await findByText(/trials-count/i);
};

it("renders without crashing", async () => {
    const { queryByText, findByText } = renderAsRouteComponent(HomePage);
    expect(queryByText(/Cancer Immunologic Data Commons/g)).toBeInTheDocument();
    await waitForLoadComplete(findByText);
});

it("renders statistics about the data portal", async () => {
    const { findByText, getByText } = renderAsRouteComponent(HomePage);
    expect(
        (await findByText(/trials-count/i))!.getAttribute("aria-labelledby")
    ).toBe("trials");
    expect(
        getByText(/participants-count/i).getAttribute("aria-labelledby")
    ).toBe("participants");
    expect(getByText(/samples-count/i).getAttribute("aria-labelledby")).toBe(
        "samples"
    );
    expect(getByText(/assays-count/i).getAttribute("aria-labelledby")).toBe(
        "assays"
    );
    expect(getByText(/files-count/i).getAttribute("aria-labelledby")).toBe(
        "files"
    );
    expect(getByText(/1 b/i).getAttribute("aria-labelledby")).toBe("data");
});

it("renders logos for supporting organizations", async () => {
    const { queryByAltText, findByText } = renderAsRouteComponent(HomePage);
    expect(queryByAltText("FNIH logo")).toBeInTheDocument();
    expect(queryByAltText("NCI logo")).toBeInTheDocument();
    expect(queryByAltText("PACT logo")).toBeInTheDocument();
    await waitForLoadComplete(findByText);
});

const user = { first_n: "foo", last_n: "bar", approval_date: "01/01/01" };

describe("'explore the data' button", () => {
    it("it's enabled for unauthenticated users", async () => {
        const { getByText, findByText } = renderAsRouteComponent(HomePage, {
            history
        });

        fireEvent.click(getByText(/explore the data/i));
        expect(history.location.pathname).toBe("/browse-data");
        await waitForLoadComplete(findByText);
    });

    it("it's enabled for approved users", async () => {
        const Wrapped = (props: any) => {
            return (
                <UserContext.Provider value={user}>
                    <HomePage {...props} />
                </UserContext.Provider>
            );
        };
        const { getByText, findByText } = renderAsRouteComponent(Wrapped, {
            authData: { state: "logged-out" }
        });

        fireEvent.click(getByText(/explore the data/i));
        expect(history.location.pathname).toBe("/browse-data");
        await waitForLoadComplete(findByText);
    });

    it("it's disabled for authenticated, unapproved users", async () => {
        const Wrapped = (props: any) => {
            return (
                <UserContext.Provider
                    value={{ ...user, approval_date: undefined }}
                >
                    <HomePage {...props} />
                </UserContext.Provider>
            );
        };
        const { getByText, findByText } = renderAsRouteComponent(Wrapped, {
            authData: { state: "logged-out" }
        });

        const button = getByText(/explore the data/i).closest("button");
        expect(button!.disabled).toBe(true);
        await waitForLoadComplete(findByText);
    });
});

it("rounds GB correctly", async () => {
    apiFetch.mockResolvedValue({
        ...dataOverview,
        num_bytes: 9.99123e11
    });
    const { findByText } = renderAsRouteComponent(HomePage);
    expect(await findByText(/999 gb/i)).toBeInTheDocument();
});

it("rounds TB correctly", async () => {
    apiFetch.mockResolvedValue({
        ...dataOverview,
        num_bytes: 1.23e12
    });
    const { findByText } = renderAsRouteComponent(HomePage);
    expect(await findByText(/1.2 tb/i)).toBeInTheDocument();
});

describe("'pending approval'", () => {
    const approvalMessage = /thank you for submitting a registration request/i;

    test("unauthenticated users don't see it", async () => {
        const { queryByText, findByText } = renderAsRouteComponent(HomePage, {
            authData: { state: "logged-out" }
        });
        expect(queryByText(approvalMessage)).not.toBeInTheDocument();
        await waitForLoadComplete(findByText);
    });

    test("authenticated, approved users don't see it", async () => {
        const Wrapped = (props: any) => {
            return (
                <UserContext.Provider value={user}>
                    <HomePage {...props} />
                </UserContext.Provider>
            );
        };
        const { queryByText, findByText } = renderAsRouteComponent(Wrapped, {
            authData: { state: "logged-out" }
        });
        expect(queryByText(approvalMessage)).not.toBeInTheDocument();
        await waitForLoadComplete(findByText);
    });

    test("authenticated, unapproved users see it", async () => {
        const Wrapped = (props: any) => {
            return (
                <UserContext.Provider
                    value={{ ...user, approval_date: undefined }}
                >
                    <HomePage {...props} />
                </UserContext.Provider>
            );
        };
        const { queryByText, findByText } = renderAsRouteComponent(Wrapped, {
            authData: { state: "logged-out" }
        });
        expect(queryByText(approvalMessage)).toBeInTheDocument();
        await waitForLoadComplete(findByText);
    });
});
