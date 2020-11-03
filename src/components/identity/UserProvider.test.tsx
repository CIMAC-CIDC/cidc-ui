import * as React from "react";
import { getAccountInfo, getPermissionsForUser } from "../../api/api";
import { render, cleanup } from "@testing-library/react";
import history from "./History";
import { AuthContext } from "./AuthProvider";
import UserProvider, { useUserContext } from "./UserProvider";
import { Router } from "react-router";
import ErrorGuard from "../errors/ErrorGuard";
jest.mock("../../api/api");

const ChildComponent = () => <div data-testid="children" />;

const TOKEN = "blah";

function renderUserProvider(authData: boolean, children?: React.ReactElement) {
    return render(
        <Router history={history}>
            <ErrorGuard>
                <AuthContext.Provider
                    value={
                        authData
                            ? {
                                  state: "logged-in",
                                  userInfo: {
                                      idToken: TOKEN,
                                      user: { email: "" }
                                  }
                              }
                            : undefined
                    }
                >
                    <UserProvider>
                        {children || <ChildComponent />}
                    </UserProvider>
                </AuthContext.Provider>
            </ErrorGuard>
        </Router>
    );
}

it("handles an approved user", async () => {
    const user = { id: 1, approval_date: Date.now() };
    getAccountInfo.mockImplementation((token: string) => {
        expect(token).toBe(TOKEN);

        return Promise.resolve(user);
    });
    getPermissionsForUser.mockImplementation((token: string, id: number) => {
        expect(token).toBe(TOKEN);
        expect(id).toBe(user.id);

        return Promise.resolve([]);
    });

    const { findByTestId } = renderUserProvider(true);
    const children = await findByTestId("children");
    expect(children).toBeInTheDocument();
});

it("handles unapproved users", async () => {
    getAccountInfo.mockResolvedValue({ id: 1 });

    history.push("/browse-data");
    const { findByTestId } = renderUserProvider(true);
    await findByTestId("children");
    expect(history.location.pathname).toBe("/");
});

it("handles unregistered users", async () => {
    getAccountInfo.mockRejectedValue({
        response: { data: { _error: { message: "is not registered." } } }
    });

    const { findByTestId } = renderUserProvider(true);
    await findByTestId("children");
    expect(history.location.pathname).toBe("/register");
});

it("handles endpoint errors", async () => {
    getAccountInfo.mockRejectedValue({ some: "other error" });
    const { findByTestId: fbti1, queryByText } = renderUserProvider(true);
    await fbti1("children");
    expect(queryByText(/error loading account info/i)).toBeInTheDocument();
    cleanup();

    getAccountInfo.mockRejectedValue({ response: { data: "Not Found" } });
    const { findByTestId: fbti2 } = renderUserProvider(true);
    await fbti2("children");
    expect(history.location.pathname).toBe("/register");
});

it("handles a disabled user", async () => {
    const user = { id: 1, approval_date: Date.now(), disabled: true };
    getAccountInfo.mockResolvedValue(user);

    const { findByTestId } = renderUserProvider(true);
    const error = await findByTestId("error-message");
    expect(error).toBeInTheDocument();
    expect(error.textContent).toContain("Account Disabled");
});

it("enables the correct tabs for each role", async () => {
    const RoleTestComponent = () => {
        const user = useUserContext();

        if (!user) {
            return null;
        }

        return (
            <div>
                <p>showAnalyses={user.showAnalyses?.toString()}</p>
                <p>showManifests={user.showManifests?.toString()}</p>
                <p>showAssays={user.showAssays?.toString()}</p>
            </div>
        );
    };
    const mockWithRole = (role: string) => {
        getAccountInfo.mockResolvedValue({
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

    await expectedTabs.reduce(async (prevTest, { role, tabs }) => {
        await prevTest;
        mockWithRole(role);
        const { findByText } = renderUserProvider(true, <RoleTestComponent />);
        const finds = [
            await findByText(
                new RegExp(`showManifests=${tabs.includes("manifests")}`, "i")
            ),
            await findByText(
                new RegExp(`showAssays=${tabs.includes("assays")}`, "i")
            ),
            await findByText(
                new RegExp(`showAnalyses=${tabs.includes("analyses")}`, "i")
            )
        ];
        finds.map(find => expect(find).toBeInTheDocument());
        cleanup();
    }, Promise.resolve());
});
