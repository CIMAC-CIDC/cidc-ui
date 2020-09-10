import React from "react";
import Footer from "./Footer";

test("Footer renders without crashing", () => {
    const { queryByText } = renderWithRouter(<Footer />);
    expect(queryByText(/Dana-Farber Cancer Institute/g)).toBeInTheDocument();
});
