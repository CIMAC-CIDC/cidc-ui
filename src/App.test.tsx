import * as React from "react";
import * as ReactDOM from "react-dom";
import { fireEvent, render } from "@testing-library/react";
import App from "./App";
jest.mock("./api/api", () => {
    const actualApi = jest.requireActual("./api/api");
    return {
        ...actualApi,
        apiFetch: jest.fn().mockReturnValue({ _items: [], trial_ids: [] })
    };
});
jest.mock("./components/info/InfoProvider", () => {
    const { InfoContext, ...actualInfoProvider } = jest.requireActual(
        "./components/info/InfoProvider"
    );

    return {
        __esModule: true,
        ...actualInfoProvider,
        InfoContext,
        default: jest.fn().mockImplementation(props => {
            return (
                <InfoContext.Provider
                    value={{ supportedTemplates: { manifests: [] } }}
                >
                    {props.children}
                </InfoContext.Provider>
            );
        })
    };
});

jest.mock("./components/identity/IdentityProvider", () => {
    const { AuthContext } = jest.requireActual(
        "./components/identity/AuthProvider"
    );
    const { UserContext } = jest.requireActual(
        "./components/identity/UserProvider"
    );
    const actualIdentityProvider = jest.requireActual(
        "./components/identity/IdentityProvider"
    );

    return {
        __esModule: true,
        ...actualIdentityProvider,
        default: jest.fn().mockImplementation(props => {
            return (
                <AuthContext.Provider
                    value={{
                        state: "logged-in",
                        userInfo: { idToken: "test-token" }
                    }}
                >
                    <UserContext.Provider
                        value={{
                            approval_date: "1/1/1",
                            showManifests: true,
                            showAnalyses: true
                        }}
                    >
                        {props.children}
                    </UserContext.Provider>
                </AuthContext.Provider>
            );
        })
    };
});

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});

test("users can navigate to pages as expected", async () => {
    const { getByText, findByText, findByTitle } = render(<App />);

    fireEvent.click(getByText(/browse data/i));
    expect(await findByText(/trial view/i)).toBeInTheDocument();

    fireEvent.click(getByText(/pipelines/i));
    expect(await findByText(/rima/i)).toBeInTheDocument();

    fireEvent.click(getByText(/schema/i));
    expect(await findByTitle(/cidc schema/i)).toBeInTheDocument();

    fireEvent.click(getByText(/analyses/i));
    expect(await findByText(/the cidc cli/i)).toBeInTheDocument();

    fireEvent.click(getByText(/manifests/i));
    expect(await findByText(/empty manifest template/)).toBeInTheDocument();
});
