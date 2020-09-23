import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import Header, {
    EnvBanner,
    CIDCBreadcrumbs,
    DONT_RENDER_PATHS
} from "./Header";
import {
    IAccountWithExtraContext,
    UserContext
} from "../identity/UserProvider";
import history from "../identity/History";
import { Account } from "../../model/account";
import { act } from "react-dom/test-utils";
import { renderWithRouter } from "../../../test/helpers";

const user: Account = {
    id: 1,
    _etag: "",
    _created: "",
    _updated: "",
    email: "",
    disabled: false,
    organization: "DFCI"
};
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

    it("renders with minimal tab visibility by default", () => {
        const { queryByText } = renderWithRouter(<Header />);
        checkVisibility(
            queryByText,
            ["browse data", "pipelines", "schema", "profile"],
            ["manifests", "assays", "analyses"]
        );
    });

    it("renders correct tabs based on the user context configuration", () => {
        // cidc user
        const { queryByText: q1 } = renderWithUserContext({
            ...user
        });
        checkVisibility(
            q1,
            ["browse data", "pipelines", "schema", "profile"],
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
            ["browse data", "pipelines", "schema", "profile", "assays"],
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
            ["browse data", "pipelines", "schema", "profile", "manifests"],
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
            [
                "browse data",
                "pipelines",
                "schema",
                "profile",
                "assays",
                "analyses"
            ],
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
                "profile",
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
            "profile",
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

describe("CIDCBreadcrumbs", () => {
    const checkPath = (queryByText: (re: RegExp) => void, path: string[]) => {
        path.forEach(p => {
            expect(queryByText(new RegExp(p, "i"))).toBeInTheDocument();
        });
    };

    it("handles the index path", () => {
        const { queryByText } = renderWithRouter(<CIDCBreadcrumbs />, {
            route: "/"
        });

        checkPath(queryByText, ["cidc"]);
    });

    it("handles a nested path", () => {
        const { queryByText } = renderWithRouter(<CIDCBreadcrumbs />, {
            route: "/assays/wes"
        });

        checkPath(queryByText, ["cidc", "assays", "wes"]);
    });

    it("handles a path with dashed parts", () => {
        const { queryByText } = renderWithRouter(<CIDCBreadcrumbs />, {
            route: "/browse-data"
        });

        checkPath(queryByText, ["cidc", "browse data"]);
    });

    it("provides links in the breadcrumb hierarchy", () => {
        history.replace("/browse-data/123");
        const { getByText, queryByText } = renderWithRouter(
            <CIDCBreadcrumbs />,
            { history }
        );

        // navigate up one level
        fireEvent.click(getByText(/browse data/i));
        expect(history.location.pathname).toBe("/browse-data");
        expect(queryByText(/123/i)).not.toBeInTheDocument();

        // navigate up two levels
        history.goBack();
        fireEvent.click(getByText(/cidc/i));
        expect(history.location.pathname).toBe("/");
        expect(queryByText(/browse data/i)).not.toBeInTheDocument();
        expect(queryByText(/123/i)).not.toBeInTheDocument();
    });
});
