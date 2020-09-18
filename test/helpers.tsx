import React from "react";
import { Router, Route, RouteProps } from "react-router-dom";
import { createMemoryHistory, History } from "history";
import { render } from "@testing-library/react";
import {
    IAuthData,
    AuthContext
} from "../src/components/identity/AuthProvider";
import {
    IAccountWithExtraContext,
    UserContext
} from "../src/components/identity/UserProvider";

export const renderWithRouter = (
    element: React.ReactElement,
    {
        route = "/",
        history = createMemoryHistory({ initialEntries: [route] })
    } = {} as { route?: string; history?: History<any> }
) => {
    return render(<Router history={history}>{element}</Router>);
};

export const renderAsRouteComponent = (
    component: RouteProps["component"],
    {
        path = "/",
        route = "/",
        history = createMemoryHistory({ initialEntries: [route] }),
        authData = {}
    } = {} as {
        path?: string;
        route: string;
        history?: History;
        authData?: Partial<IAuthData>;
    }
) => {
    const out = (
        <Router history={history}>
            <Route path={path} component={component} />
        </Router>
    );
    return render(
        authData ? (
            <AuthContext.Provider
                value={{ idToken: "", user: { email: "" }, ...authData }}
            >
                {out}
            </AuthContext.Provider>
        ) : (
            out
        )
    );
};

export const renderWithUserContext = (
    element: React.ReactElement,
    user?: Partial<IAccountWithExtraContext>
) => {
    return render(
        // @ts-ignore
        <UserContext.Provider value={user}>{element}</UserContext.Provider>
    );
};

export const getNativeCheckbox = (
    muiCheckbox: HTMLElement
): HTMLInputElement => {
    // @ts-ignore
    return muiCheckbox.querySelector('input[type="checkbox"]');
};
