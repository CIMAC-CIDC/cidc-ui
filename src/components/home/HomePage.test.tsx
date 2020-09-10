import React from "react";
import HomePage from "./HomePage";
import { render } from "@testing-library/react";

test("HomePage renders without crashing", () => {
    const { queryByText } = render(<HomePage />);
    expect(
        queryByText(/Welcome to the CIMAC-CIDC Data Portal/g)
    ).toBeInTheDocument();
});
