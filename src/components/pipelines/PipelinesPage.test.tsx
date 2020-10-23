import React from "react";
import PipelinesPage from "./PipelinesPage";
import { fireEvent } from "@testing-library/react";
import axios from "axios";
import { renderWithRouter } from "../../../test/helpers";
jest.mock("axios");
axios.get.mockResolvedValue("");

it("switches between documentation tabs", () => {
    const { getByText, getByRole } = renderWithRouter(<PipelinesPage />, {
        route: "/pipelines"
    });

    // RNA docs display first by default
    expect(getByRole("document").id).toBe("rna-docs");

    // WES docs display after click
    fireEvent.click(getByText(/WES/));
    expect(getByRole("document").id).toBe("wes-docs");

    // RNA docs display after click
    fireEvent.click(getByText(/RIMA/));
    expect(getByRole("document").id).toBe("rna-docs");
});

it("renders the correct tab for a given route", () => {
    const { getByRole } = renderWithRouter(<PipelinesPage />, {
        route: "/pipelines/wes"
    });
    expect(getByRole("document").id).toBe("wes-docs");
});
