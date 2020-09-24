import * as React from "react";
import { render } from "@testing-library/react";
import ErrorGuard, { ErrorContext } from "./ErrorGuard";
import history from "../identity/History";

it("renders a component that doesn't error", () => {
    const HappyComponent = () => <div data-testid="happy" />;

    const { queryByTestId } = render(
        <ErrorGuard>
            <HappyComponent />
        </ErrorGuard>
    );
    expect(queryByTestId("happy")).toBeInTheDocument();
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
});

it("renders an error page for a component that errors and maintains route", () => {
    const pathname = "/blah-blah-blah";
    history.replace(pathname);

    const testError = {
        type: "Request Error",
        message: "uh oh",
        details: {
            foo: "bar"
        }
    };

    const UnhappyComponent = () => {
        const setError = React.useContext(ErrorContext);

        React.useEffect(() => {
            setError(testError);
        });

        return <div data-testid="unhappy" />;
    };

    const { queryByTestId, getByText } = render(
        <ErrorGuard>
            <UnhappyComponent />
        </ErrorGuard>
    );
    expect(queryByTestId("unhappy")).not.toBeInTheDocument();
    expect(queryByTestId("error-message")).toBeInTheDocument();
    expect(getByText("Request Error - uh oh")).toBeInTheDocument();
    expect(history.location.pathname).toBe(pathname);
});
