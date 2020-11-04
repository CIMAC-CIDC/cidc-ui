import React from "react";
import { cleanup, fireEvent } from "@testing-library/react";
import Header, { EnvBanner, DONT_RENDER_PATHS } from "./Header";
import {
    IAccountWithExtraContext,
    UserContext
} from "../identity/UserProvider";
import history from "../identity/History";
import { Account } from "../../model/account";
import { act } from "react-dom/test-utils";
import { renderWithRouter } from "../../../test/helpers";
import { login, logout } from "../identity/AuthProvider";
jest.mock("../identity/AuthProvider");

const user: Account = {
    id: 1,
    _etag: "",
    _created: "",
    _updated: "",
    first_n: "foo",
    last_n: "bar",
    email: "",
    disabled: false,
    organization: "DFCI",
    picture: "some-url",
    approval_date: "01/01/01",
    role: "cimac-user"
};
const avatarAltText = /foo bar's avatar/i;
const renderWithUserContext = (u: IAccountWithExtraContext) => {
    return renderWithRouter(
        <UserContext.Provider value={u}>
            <Header />
        </UserContext.Provider>,
        { history }
    );
};

describe("Header", () => {
    const checkVisibility = (
        queryByText: (q: RegExp) => void,
        visible: string[],
        invisible: string[]
    ) => {
        visible.forEach(v => {
            expect(queryByText(new RegExp(v, "i"))).toBeInTheDocument();
        });
        invisible.forEach(v => {
            expect(queryByText(new RegExp(v, "i"))).not.toBeInTheDocument();
        });
    };

    const checkNoTabs = (queryByText: (q: RegExp) => void) => {
        checkVisibility(
            queryByText,
            [],
            [
                "browse data",
                "pipelines",
                "schema",
                "manifests",
                "assays",
                "analyses"
            ]
        );
    };

    it("renders a sign up / log in button if no user is provided", () => {
        const { getByText, queryByText, queryByAltText } = renderWithRouter(
            <Header />,
            {
                authData: { state: "logged-out" }
            }
        );
        const button = getByText(/sign up \/ log in/i).closest("button");
        fireEvent.click(button!);
        expect(login).toHaveBeenCalled();

        // ensure the UserProfileMenu isn't rendered
        expect(queryByAltText(avatarAltText)).not.toBeInTheDocument();

        // ensure no tabs are rendered for unauthenticated users
        checkNoTabs(queryByText);
    });

    it("renders the UserProfileMenu if a user is provided", () => {
        const { queryByAltText } = renderWithRouter(
            <UserContext.Provider value={user}>
                <Header />
            </UserContext.Provider>
        );
        expect(queryByAltText(avatarAltText)).toBeInTheDocument();
    });

    it("renders correct tabs based on the user context configuration", () => {
        // unactivated user (can't see any tabs)
        const { queryByText: q0 } = renderWithUserContext({
            ...user,
            approval_date: undefined
        });
        checkNoTabs(q0);
        cleanup();

        // cidc user
        const { queryByText: q1 } = renderWithUserContext(user);
        checkVisibility(
            q1,
            ["browse data", "pipelines", "schema"],
            ["manifests", "assays", "analyses"]
        );
        cleanup();

        // cimac user
        const { queryByText: q2 } = renderWithUserContext({
            ...user,
            showAssays: true
        });
        checkVisibility(
            q2,
            ["browse data", "pipelines", "schema", "assays"],
            ["manifests", "analyses"]
        );
        cleanup();

        // nci user
        const { queryByText: q3 } = renderWithUserContext({
            ...user,
            showManifests: true
        });
        checkVisibility(
            q3,
            ["browse data", "pipelines", "schema", "manifests"],
            ["assays", "analyses"]
        );
        cleanup();

        // cidc biofx user
        const { queryByText: q4 } = renderWithUserContext({
            ...user,
            showAssays: true,
            showAnalyses: true
        });
        checkVisibility(
            q4,
            ["browse data", "pipelines", "schema", "assays", "analyses"],
            ["manifests"]
        );
        cleanup();

        // cidc admin
        const { queryByText: q5 } = renderWithUserContext({
            ...user,
            showAssays: true,
            showAnalyses: true,
            showManifests: true
        });
        checkVisibility(
            q5,
            [
                "browse data",
                "pipelines",
                "schema",
                "assays",
                "analyses",
                "manifests"
            ],
            []
        );
    });

    it("navigates on tab click", () => {
        history.push("/");
        const { getByText } = renderWithUserContext({
            ...user,
            showAssays: true,
            showAnalyses: true,
            showManifests: true
        });

        [
            "browse-data",
            "pipelines",
            "schema",
            "assays",
            "analyses",
            "manifests"
        ].forEach(path => {
            act(() => {
                fireEvent.click(
                    getByText(new RegExp(path.replace("-", " "), "i"))
                );
            });
            expect(history.location.pathname).toContain(path);
        });
    });

    it("doesn't render on certain pathnames", () => {
        const { queryByTestId } = renderWithUserContext({
            ...user,
            showAssays: true,
            showAnalyses: true,
            showManifests: true
        });
        DONT_RENDER_PATHS.forEach(pathname => {
            history.push(pathname);
            expect(queryByTestId(/header/i)).not.toBeInTheDocument();
        });
    });
});

describe("EnvBanner", () => {
    it("renders a warning if the environment isn't prod", () => {
        const { queryByText } = renderWithRouter(<EnvBanner />);

        expect(
            queryByText(/warning! you're accessing a development instance/i)
        ).toBeInTheDocument();
    });

    it("doesn't render a warning if the environment is prod", () => {
        // set ENV to prod and reload the EnvBanner component
        const oldENV = process.env.REACT_APP_ENV;
        process.env.REACT_APP_ENV = "prod";
        jest.resetModules();
        const ProdEnvBanner = require("./Header").EnvBanner;

        const { queryByText } = renderWithRouter(<ProdEnvBanner />);

        expect(
            queryByText(/warning! you're accessing a development instance/i)
        ).not.toBeInTheDocument();

        // reset the ENV
        process.env.REACT_APP_ENV = oldENV;
    });
});

describe("UserProfileMenu", () => {
    it("opens on click and shows expected options to approved users", () => {
        const { queryByText, getByAltText } = renderWithRouter(
            <UserContext.Provider value={user}>
                <Header />
            </UserContext.Provider>
        );
        expect(queryByText(/profile/i)).not.toBeInTheDocument();

        // opens on click
        fireEvent.click(getByAltText(avatarAltText));
        expect(queryByText(/profile/i)).toBeInTheDocument();
        expect(queryByText(/log out/i)).toBeInTheDocument();
    });

    it("opens on click and shows expected options to unapproved users", () => {
        const { queryByText, getByAltText } = renderWithRouter(
            <UserContext.Provider value={{ ...user, approval_date: undefined }}>
                <Header />
            </UserContext.Provider>
        );
        expect(queryByText(/log out/i)).not.toBeInTheDocument();

        // opens on click
        fireEvent.click(getByAltText(avatarAltText));
        expect(queryByText(/profile/i)).not.toBeInTheDocument();
        expect(queryByText(/log out/i)).toBeInTheDocument();
    });

    it("navigates to /profile when the 'profile' option is clicked", () => {
        history.push("/");
        const { getByText, getByAltText } = renderWithRouter(
            <UserContext.Provider value={user}>
                <Header />
            </UserContext.Provider>,
            { history }
        );
        fireEvent.click(getByAltText(avatarAltText));
        fireEvent.click(getByText(/profile/i));
        expect(history.location.pathname).toContain("/profile");
    });

    it("calls the logout function when the 'logout' option is clicked", () => {
        const { getByText, getByAltText } = renderWithRouter(
            <UserContext.Provider value={user}>
                <Header />
            </UserContext.Provider>
        );
        fireEvent.click(getByAltText(avatarAltText));
        fireEvent.click(getByText(/log out/i));
        expect(logout).toHaveBeenCalled();
    });
});
