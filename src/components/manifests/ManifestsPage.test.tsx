import React from "react";
import { render } from "@testing-library/react";
import ManifestsPage from "./ManifestsPage";

it("ManifestsPage renders without crashing", () => {
    const { queryAllByText } = render(<ManifestsPage />);
    expect(queryAllByText(/manifest/gi).length).toBeGreaterThan(0);
});
