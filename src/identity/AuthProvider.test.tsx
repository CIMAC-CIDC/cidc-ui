import * as React from "react";
import { render, waitForElement } from "@testing-library/react";
import AuthProvider, { auth0Client } from "./AuthProvider";
import auth0 from "auth0-js";
import { Router } from "react-router";
import history from "./History";
jest.mock("auth0-js");

auth0.WebAuth.mockImplementation(() => ({
    authorize: jest.fn(),
    logout: jest.fn(),
    checkSession: jest.fn(),
    parseHash: jest.fn()
}));

const ChildComponent = () => <div data-testid="children" />;

function renderWithChild() {
    return render(
        <Router history={history}>
            <AuthProvider>
                <ChildComponent />
            </AuthProvider>
        </Router>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    jest.clearAllMocks();
});

it("triggers login and doesn't render the app", () => {
    const { queryByTestId } = renderWithChild();
    expect(auth0Client.authorize).toBeCalledTimes(1);
    expect(queryByTestId("children")).not.toBeInTheDocument();
});

it("handles requests to '/callback' as expected", async () => {
    const { getByTestId } = renderWithChild();
    history.replace("/callback");
    const callbackLoader = await waitForElement(() =>
        getByTestId("callback-loader")
    );
    expect(callbackLoader).toBeInTheDocument();
    expect(auth0Client.parseHash).toBeCalledTimes(1);
});

it("handles requests to '/logout' as expected", async () => {
    history.replace("/logout");

    // Set up a fake session
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("expiresAt", "99999999999");

    const { queryByTestId } = renderWithChild();

    const children = queryByTestId("children");
    expect(children).not.toBeInTheDocument();

    // Check that session was cleared
    expect(localStorage.getItem("isLoggedIn")).toBeNull();
    expect(localStorage.getItem("expiresAt")).toBeNull();

    expect(auth0Client.logout).toBeCalledTimes(1);
    expect(auth0Client.checkSession).not.toBeCalled();
});

it("handles silent auth as expected", () => {
    history.replace("/");

    // Set up a fake session with expired token
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("expiresAt", "0");

    renderWithChild();
    // User should be logged in silently, not explicitly
    expect(auth0Client.checkSession).toBeCalledTimes(1);
    expect(auth0Client.authorize).toBeCalledTimes(0);

    auth0Client.checkSession.mockClear();

    // Set up logged-out session
    localStorage.setItem("isLoggedIn", "false");

    renderWithChild();
    // User should be logged in explicitly, not silently
    expect(auth0Client.checkSession).not.toBeCalled();
    expect(auth0Client.authorize).toBeCalledTimes(1);
});
