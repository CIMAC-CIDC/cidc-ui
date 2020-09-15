import React from "react";
import PipelinesPage from "./PipelinesPage";
import { fireEvent } from "@testing-library/react";
import axios from "axios";
import { renderWithRouter } from "../../../test/helpers";
jest.mock("axios");
axios.get.mockResolvedValue("");

it("renders without crashing", () => {
    const { queryByText } = renderWithRouter(<PipelinesPage />);
    expect(queryByText(/Pipeline Docs/)).toBeInTheDocument();
});

it("switches between documentation tabs", () => {
    const { getByText, queryByRole } = renderWithRouter(<PipelinesPage />);

    // RNA docs display first by default
    expect(queryByRole("document").id).toBe("rna-docs");

    // WES docs display after click
    fireEvent.click(getByText(/WES/));
    expect(queryByRole("document").id).toBe("wes-docs");

    // RNA docs display after click
    fireEvent.click(getByText(/RIMA/));
    expect(queryByRole("document").id).toBe("rna-docs");
});
