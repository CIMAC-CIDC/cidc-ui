import React from "react";
import { Router, Route, RouteProps } from "react-router-dom";
import { createMemoryHistory, History } from "history";
import { render } from "@testing-library/react";

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
        history = createMemoryHistory({ initialEntries: [route] })
    } = {} as { path?: string; route: string; history?: History<any> }
) => {
    return render(
        <Router history={history}>
            <Route path={path} component={component} />
        </Router>
    );
};
