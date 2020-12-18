import * as React from "react";
import { apiFetch } from "../../api/api";
import { waitFor } from "@testing-library/react";
import history from "./History";
import UserProvider, { useUserContext } from "./UserProvider";
import { renderWithRouter } from "../../../test/helpers";
import ErrorGuard from "../errors/ErrorGuard";
jest.mock("../../api/api");

const ChildComponent = () => {
    const user = useUserContext();
    return user ? <div data-testid="children" /> : null;
};

const TOKEN = "blah";

function renderUserProvider(children = <ChildComponent />, idToken = TOKEN) {
    return renderWithRouter(
        <ErrorGuard>
            <UserProvider>{children}</UserProvider>
        </ErrorGuard>,
        {
            history,
            route: "/browse-data",
            authData: {
                state: "logged-in",
                userInfo: { idToken, user: { email: "" } }
            }
        }
    );
}

const waitForPath = async (path: string) => {
    await waitFor(() => {
        expect(history.location.pathname).toBe(path);
    });
};

it("handles an approved user", async () => {
    const user = { id: 1, approval_date: Date.now() };
    apiFetch.mockImplementation(async (url: string) => {
        if (url === "/users/self") {
            return user;
        }
        return [];
    });

    const { findByTestId } = renderUserProvider();
    await findByTestId("children");
    expect(apiFetch).toHaveBeenCalledWith("/users/self", TOKEN);
});

it("handles unapproved users", async () => {
    history.replace("/browse-data");
    apiFetch.mockResolvedValue({ id: 1 });
    renderUserProvider(<ChildComponent />, "cache-busting-token");
    await waitForPath("/");
});

it("handles unregistered users", async () => {
    apiFetch.mockRejectedValue({
        response: { data: { _error: { message: "is not registered." } } }
    });
    renderUserProvider();
    await waitForPath("/register");
});

it("handles a generic endpoint error", async () => {
    apiFetch.mockRejectedValue({ some: "other error" });
    const { findByText } = renderUserProvider();
    expect(await findByText(/error loading account info/i)).toBeInTheDocument();
});

it("handles a disabled user", async () => {
    const user = { id: 1, approval_date: Date.now(), disabled: true };
    apiFetch.mockResolvedValue(user);

    const { findByTestId } = renderUserProvider();
    const error = await findByTestId("error-message");
    expect(error).toBeInTheDocument();
    expect(error.textContent).toContain("Account Disabled");
});

describe("role-based tab display", () => {
    const RoleTestComponent = () => {
        const user = useUserContext();

        if (!user) {
            return null;
        }

        return (
            <div data-testid="results">
                <p>showAnalyses={user.showAnalyses?.toString()}</p>
                <p>showManifests={user.showManifests?.toString()}</p>
                <p>showAssays={user.showAssays?.toString()}</p>
            </div>
        );
    };
    const mockWithRole = (role: string) => {
        apiFetch.mockResolvedValue({
            id: 1,
            role,
            approval_date: Date.now()
        });
    };

    const expectedTabs = [
        { role: "cimac-user", tabs: [] },
        { role: "cimac-biofx-user", tabs: ["assays"] },
        { role: "cidc-biofx-user", tabs: ["assays", "analyses"] },
        { role: "nci-biobank-user", tabs: ["manifests"] },
        { role: "cidc-admin", tabs: ["assays", "analyses", "manifests"] }
    ];

    expectedTabs.forEach(({ role, tabs }) => {
        it(`shows the correct tabs for a ${role}`, async () => {
            mockWithRole(role);
            const { queryByText, findByTestId } = renderUserProvider(
                <RoleTestComponent />
            );
            await findByTestId("results");
            expect(
                queryByText(`showManifests=${tabs.includes("manifests")}`)
            ).toBeInTheDocument();
            expect(
                queryByText(`showAssays=${tabs.includes("assays")}`)
            ).toBeInTheDocument();

            expect(
                queryByText(`showAnalyses=${tabs.includes("analyses")}`)
            ).toBeInTheDocument();
        });
    });
});
