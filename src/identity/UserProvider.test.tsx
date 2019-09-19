import * as React from "react";
import { getAccountInfo } from "../api/api";
import { render, waitForElement } from "@testing-library/react";
import history from "./History";
import { AuthContext } from "./AuthProvider";
import UserProvider from "./UserProvider";
import { Router } from "react-router";
jest.mock("../api/api");

const ChildComponent = () => <div data-testid="children" />;

const TOKEN = "blah";

function renderWithMockedAuthContext(authData: boolean) {
    return render(
        <Router history={history}>
            <AuthContext.Provider
                value={
                    authData
                        ? {
                              idToken: TOKEN,
                              user: { email: "" }
                          }
                        : undefined
                }
            >
                <UserProvider>
                    <ChildComponent />
                </UserProvider>
            </AuthContext.Provider>
        </Router>
    );
}

it("displays a loader if no auth data has loaded", () => {
    const { queryByTestId } = renderWithMockedAuthContext(false);
    expect(queryByTestId("loader")).toBeInTheDocument();
    expect(queryByTestId("children")).not.toBeInTheDocument();
});

it("handles an approved user", async () => {
    getAccountInfo.mockImplementation((token: string) => {
        expect(token).toBe(TOKEN);

        return Promise.resolve({ approval_date: Date.now() });
    });
    const { getByTestId } = renderWithMockedAuthContext(true);
    const children = await waitForElement(() => getByTestId("children"));
    expect(children).toBeInTheDocument();
});
