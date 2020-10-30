import React from "react";
import HomePage from "./HomePage";
import { renderAsRouteComponent } from "../../../test/helpers";

test("HomePage renders without crashing", () => {
    const { queryByText } = renderAsRouteComponent(HomePage);
    expect(queryByText(/Cancer Immunologic Data Commons/g)).toBeInTheDocument();
});
