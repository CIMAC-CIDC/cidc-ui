import * as React from "react";
import { render, waitForElement } from "@testing-library/react";
import AuthProvider, {
    auth0Client,
    setSession,
    handleAuthentication
} from "./AuthProvider";
import auth0 from "auth0-js";
import { Router } from "react-router";
import history from "./History";
import { Location } from "history";
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

test("session setter", () => {
    // Mock out a test sessionSetter
    const setAuthData = jest.fn();
    const onComplete = jest.fn();
    const sessionSetter = setSession(setAuthData, onComplete);

    const targetRoute = "/test-route";

    // Well-behaved input
    const decodedHash = {
        idTokenPayload: {
            email: "a",
            given_name: "b",
            family_name: "c",
            exp: 1
        },
        idToken: "foobar"
    };
    sessionSetter(decodedHash, targetRoute);

    const expectedUser = {
        email: decodedHash.idTokenPayload.email,
        first_n: decodedHash.idTokenPayload.given_name,
        last_n: decodedHash.idTokenPayload.family_name
    };
    expect(setAuthData).toHaveBeenCalledWith({
        idToken: decodedHash.idToken,
        user: expectedUser
    });
    expect(history.location.pathname).toEqual(targetRoute);

    // Reset
    history.replace("/");
    onComplete.mockClear();

    // Input with missing scopes
    console.error = jest.fn();
    const decodedHashWithMissingScopes = {
        idTokenPayload: {
            email: "a",
            exp: 1
        },
        idToken: "foobar"
    };
    sessionSetter(decodedHashWithMissingScopes, targetRoute);
    expect(console.error).toHaveBeenCalledWith(
        "userinfo missing required scope(s)"
    );
    expect(history.location.pathname).toEqual("/error");
    expect(onComplete).not.toHaveBeenCalled();

    // Reset
    history.replace("/");

    // Hash with missing fields
    sessionSetter({}, targetRoute);
    expect(console.error).toHaveBeenCalledWith(
        "Cannot set session: missing id token"
    );
    expect(history.location.pathname).toBe("/error");
    expect(onComplete).not.toHaveBeenCalled();
});

test("handleAuthentication", () => {
    const sessionSetter = jest.fn();

    const targetRoute = "/test-route";

    // Good inputs: complete auth result, and location with "next" param
    const authResult = {
        accessToken: "a",
        idToken: "b"
    };
    auth0Client.parseHash = jest.fn((handler: any) =>
        handler(undefined, authResult)
    );
    const location = { search: `?next=${targetRoute}` } as Location;
    handleAuthentication(location, sessionSetter);
    expect(auth0Client.parseHash).toHaveBeenCalled();
    expect(sessionSetter).toHaveBeenCalledWith(authResult, targetRoute);

    jest.clearAllMocks();

    // Missing "next" param on location
    const locationMissingNext = { search: "" } as Location;
    handleAuthentication(locationMissingNext, sessionSetter);
    expect(auth0Client.parseHash).toHaveBeenCalled();
    expect(sessionSetter).toHaveBeenCalledWith(authResult, "/");

    jest.clearAllMocks();

    // Missing fields in authResult
    history.replace("/");
    auth0Client.parseHash = jest.fn((handler: any) => handler(undefined, {}));
    handleAuthentication(location, sessionSetter);
    expect(auth0Client.parseHash).toHaveBeenCalled();
    expect(sessionSetter).not.toHaveBeenCalled();
    expect(history.location.pathname).toBe("/error");
});
