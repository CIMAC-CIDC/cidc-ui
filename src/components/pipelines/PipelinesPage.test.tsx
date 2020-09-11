import React from "react";
import PipelinesPage from "./PipelinesPage";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";

it("PipelinesPage renders without crashing", () => {
    const { queryByText } = renderWithRouter(<PipelinesPage />);
    expect(queryByText(/Pipeline Docs/)).toBeInTheDocument();
});

it("Switches between documentation tabs", () => {
    const { getByText, queryByRole } = renderWithRouter(<PipelinesPage />);

    // RNA docs display first by default
    expect(queryByRole("document").id).toBe("rna-docs");

    // WES docs display after click
    act(() => {
        fireEvent.click(getByText(/WES/));
    });
    expect(queryByRole("document").id).toBe("wes-docs");

    // RNA docs display after click
    act(() => {
        fireEvent.click(getByText(/RIMA/));
    });
    expect(queryByRole("document").id).toBe("rna-docs");
});
