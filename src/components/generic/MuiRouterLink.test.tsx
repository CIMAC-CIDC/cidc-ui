import React from "react";
import { renderWithRouter } from "../../../test/helpers";
import MuiRouterLink from "./MuiRouterLink";

it("has an href attribute set", () => {
    const url = "/some/cool/location";
    const text = "hello friends";
    const { getByText } = renderWithRouter(
        <MuiRouterLink to={url}>{text}</MuiRouterLink>
    );
    const aTag = getByText(text).closest("a");
    expect(aTag?.href).toContain(url);
});
