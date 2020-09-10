import React from "react";
import SchemaPage from "./SchemaPage";
import { render } from "@testing-library/react";

test("SchemaPage renders without crashing", () => {
    const { queryByTitle } = render(<SchemaPage />);
    expect(queryByTitle(/CIDC Schema/)).toBeInTheDocument();
});
