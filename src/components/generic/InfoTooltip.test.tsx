import React from "react";
import { render, fireEvent } from "@testing-library/react";
import InfoTooltip from "./InfoTooltip";

const text = "some info text";
const component = <InfoTooltip text={text}>base text</InfoTooltip>;

it("shows children when tooltip isn't visible", () => {
    const { queryByText, queryByRole } = render(component);

    expect(queryByText(/base text/i)).toBeInTheDocument();
    expect(queryByRole("tooltip")).toBeInTheDocument();
    expect(queryByText(new RegExp(text, "i"))).not.toBeInTheDocument();
});

it("shows the tooltip text on hover", async () => {
    const { findByText, queryByText, getByRole } = render(component);

    fireEvent.mouseOver(getByRole("tooltip"));

    expect(await findByText(new RegExp(text, "i"))).toBeInTheDocument();
    expect(queryByText(/base text/i)).toBeInTheDocument();
});
