import React from "react";
import { render, fireEvent } from "@testing-library/react";
import IHCBarplot from "./IHCBarplot";

it("renders a plot when some data columns are available", () => {
    const ihcData = [
        {
            h_score: 0,
            cps: 0,
            foo: ""
        },
        {
            h_score: 1,
            cps: 1,
            foo: ""
        }
    ];
    const { queryByText, queryAllByText, getByText } = render(
        <IHCBarplot data={ihcData} />
    );
    // control panel rendered
    expect(queryByText(/color by/i)).toBeInTheDocument();
    // plot rendered with expected default y-axis value
    expect(queryByText(/cps/i)).toBeInTheDocument();
    expect(queryByText(/h_score/i)).not.toBeInTheDocument();

    // change which data column is selected
    fireEvent.mouseDown(getByText(/cps/i));
    fireEvent.click(getByText(/h_score/i));
    expect(queryAllByText(/h_score/i).length).toBeGreaterThan(0);
});

it("renders an error message when no data columns are available", () => {
    const ihcDataNoDataColumns = [{ foo: "bar" }];
    const { queryByText } = render(<IHCBarplot data={ihcDataNoDataColumns} />);
    expect(
        queryByText(
            /failed to build an IHC expression distribution visualization/i
        )
    ).toBeInTheDocument();
});
