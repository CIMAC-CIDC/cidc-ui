import * as React from "react";
import { render, cleanup, act } from "@testing-library/react";
import AuthProvider, {
    auth0Client,
    IAuthData,
    AuthContext,
    login
} from "./AuthProvider";
import auth0, { Auth0Callback } from "auth0-js";
import { Router } from "react-router";
import history from "./History";
jest.mock("auth0-js");

auth0.WebAuth.mockImplementation(() => ({
    authorize: jest.fn(),
    logout: jest.fn(),
    checkSession: jest.fn()
}));

const authResponse = {
    idToken: "test-token",
    idTokenPayload: {
        email: "test@email.com",
        given_name: "john",
        family_name: "doe"
    }
};

const mockSignedIn = () => {
    auth0Client.checkSession.mockImplementation(
        (_: any, cb: Auth0Callback<any>) => {
            cb(null, authResponse);
        }
    );
};

const ChildComponent = () => <div data-testid="children" />;

function renderWithChild(child: React.ReactElement = <ChildComponent />) {
    return render(
        <Router history={history}>
            <AuthProvider>{child}</AuthProvider>
        </Router>
    );
}

afterEach(() => {
    jest.resetAllMocks();
});

it("triggers login when login is required", () => {
    auth0Client.checkSession.mockImplementation(
        (_: any, cb: Auth0Callback<any>) => {
            cb({ code: "login_required" }, {});
        }
    );
    const { queryByTestId } = renderWithChild();
    expect(auth0Client.checkSession).toHaveBeenCalled();
    expect(auth0Client.authorize).toHaveBeenCalled();
    expect(queryByTestId("children")).not.toBeInTheDocument();
});

it("silently authenticates and provides userInfo and token to children", async done => {
    mockSignedIn();

    const TestChild = (props: { expects: (authData?: IAuthData) => void }) => {
        const authData = React.useContext(AuthContext);
        React.useEffect(() => {
            if (authData) {
                props.expects(authData);
                done();
            }
        }, [authData]);
        return null;
    };

    renderWithChild(
        <TestChild
            expects={authData => {
                expect(authData?.idToken).toBe(authResponse.idToken);
                expect(authData?.user.email).toBe(
                    authResponse.idTokenPayload.email
                );
                expect(authData?.user.first_n).toBe(
                    authResponse.idTokenPayload.given_name
                );
                expect(authData?.user.last_n).toBe(
                    authResponse.idTokenPayload.family_name
                );
            }}
        />
    );
});

test("login URL-encodes the redirection target", done => {
    const returnTo = "/some/path?with=multi&part=query&string";
    auth0Client.authorize.mockImplementation(({ redirectUri }: any) => {
        expect(redirectUri).toContain(encodeURIComponent(returnTo));
        done();
    });
    history.push(returnTo);
    login();
});

it("redirects from the '/callback' route on successful login", async () => {
    mockSignedIn();

    // callback with no target URL
    history.replace("/callback");
    await renderWithChild().findByTestId("children");
    expect(history.location.pathname).toBe("/");
    cleanup();

    // callback with target URL
    const returnTo = "/some/path?with=query";
    history.replace(`/callback?returnTo=${encodeURIComponent(returnTo)}`);
    await renderWithChild().findByTestId("children");
    expect(history.location.pathname + history.location.search).toBe(returnTo);
    cleanup();

    // callback with bad target URL "/callback"
    history.replace("/callback?returnTo=/callback");
    await renderWithChild().findByTestId("children");
    expect(history.location.pathname).toBe("/");
});

it("calls logout when pathname is '/logout'", async () => {
    mockSignedIn();

    const { findByTestId } = renderWithChild();
    await findByTestId("children");
    expect(auth0Client.logout).toBeCalledTimes(0);

    act(() => {
        history.replace("/logout");
    });

    expect(auth0Client.logout).toBeCalledTimes(1);
});
