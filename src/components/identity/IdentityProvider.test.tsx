import React from "react";
import { renderWithRouter } from "../../../test/helpers";
import { fullPageLoaderAltText } from "../generic/FullPageLoader";
import { AuthContext } from "./AuthProvider";
import { IdentityProviderChildren, PUBLIC_PATHS } from "./IdentityProvider";
import { UserContext } from "./UserProvider";
jest.mock("auth0-js");

describe("IdentityProviderChildren", () => {
    it("shows loader when no auth context is provided", () => {
        const { queryByAltText } = renderWithRouter(
            <IdentityProviderChildren />
        );
        expect(queryByAltText(fullPageLoaderAltText)).toBeInTheDocument();
    });

    it("shows loader when no user context is provided", () => {
        const { queryByAltText } = renderWithRouter(
            <AuthContext.Provider value={{ idToken: "test-token" }}>
                <UserContext.Provider value={undefined}>
                    <IdentityProviderChildren />
                </UserContext.Provider>
            </AuthContext.Provider>
        );
        expect(queryByAltText(fullPageLoaderAltText)).toBeInTheDocument();
    });

    const childText = "success";

    it("renders children when both auth context and user context provided", () => {
        const { queryByAltText, queryByText } = renderWithRouter(
            <AuthContext.Provider value={{ idToken: "test-token" }}>
                <UserContext.Provider value={{ foo: "bar" }}>
                    <IdentityProviderChildren
                        children={<div>{childText}</div>}
                    />
                </UserContext.Provider>
            </AuthContext.Provider>
        );
        expect(queryByAltText(fullPageLoaderAltText)).not.toBeInTheDocument();
        expect(queryByText(childText)).toBeInTheDocument();
    });

    PUBLIC_PATHS.forEach(route => {
        it(`allows unauthenticated navigation to ${route}`, () => {
            const {
                queryByText,
                queryByAltText
            } = renderWithRouter(
                <IdentityProviderChildren children={<div>{childText}</div>} />,
                { route }
            );
            expect(
                queryByAltText(fullPageLoaderAltText)
            ).not.toBeInTheDocument();
            expect(queryByText(childText)).toBeInTheDocument();
        });
    });
});
