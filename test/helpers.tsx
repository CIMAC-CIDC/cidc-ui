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
import { QueryParamProvider } from "use-query-params";
import { SWRConfig } from "swr";
import { apiFetch } from "../src/api/api";

const testSWRConfig = {
    fetcher: apiFetch,
    shouldRetryOnError: false,
    dedupingInterval: 0
};

export const renderWithSWR = (element: React.ReactElement) => {
    return render(<SWRConfig value={testSWRConfig}>{element}</SWRConfig>);
};

export const renderWithRouter = (
    element: React.ReactElement,
    {
        route = "/",
        history = createMemoryHistory({ initialEntries: [route] }),
        authData = {
            userInfo: { idToken: "", user: { email: "" } },
            state: "logged-in"
        }
    } = {} as { route?: string; history?: History<any>; authData: IAuthData }
) => {
    return renderWithSWR(
        <AuthContext.Provider value={authData}>
            <Router history={history}>
                <QueryParamProvider ReactRouterRoute={Route}>
                    {element}
                </QueryParamProvider>
            </Router>
        </AuthContext.Provider>
    );
};

export const renderAsRouteComponent = (
    component: RouteProps["component"],
    {
        path = "/",
        route = "/",
        history = createMemoryHistory({
            initialEntries: route ? [route] : undefined
        }),
        authData = {
            userInfo: { idToken: "", user: { email: "" } },
            state: "logged-in"
        }
    } = {} as {
        path?: string;
        route?: string;
        history?: History;
        authData: IAuthData;
    }
) => {
    return renderWithRouter(<Route path={path} component={component} />, {
        route,
        history,
        authData
    });
};

export const renderWithUserContext = (
    element: React.ReactElement,
    user?: Partial<IAccountWithExtraContext>
) => {
    return renderWithSWR(
        <AuthContext.Provider
            value={
                // @ts-ignore
                { state: "logged-in", userInfo: { idToken: "test-token" } }
            }
        >
            <UserContext.Provider
                // @ts-ignore
                value={user}
            >
                {element}
            </UserContext.Provider>
        </AuthContext.Provider>
    );
};

export const getNativeCheckbox = (
    muiCheckbox: HTMLElement
): HTMLInputElement => {
    // @ts-ignore
    return muiCheckbox.querySelector('input[type="checkbox"]');
};
