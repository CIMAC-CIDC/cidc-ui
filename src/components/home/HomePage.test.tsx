import React from "react";
import HomePage from "./HomePage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { getDataOverview, IDataOverview } from "../../api/api";
import history from "../identity/History";
import { fireEvent } from "@testing-library/react";
jest.mock("../../api/api");

const dataOverview: IDataOverview = {
    num_trials: 1,
    num_participants: 2,
    num_samples: 3,
    num_assays: 4,
    num_files: 5,
    num_bytes: 9876
};

beforeEach(() => {
    getDataOverview.mockResolvedValue(dataOverview);
});

it("renders without crashing", () => {
    const { queryByText } = renderAsRouteComponent(HomePage);
    expect(queryByText(/Cancer Immunologic Data Commons/g)).toBeInTheDocument();
});

it("renders statistics about the data portal", async () => {
    const { findByText, getByText } = renderAsRouteComponent(HomePage);
    expect((await findByText(/1/i))!.getAttribute("aria-labelledby")).toBe(
        "trials"
    );
    expect(getByText(/2/i).getAttribute("aria-labelledby")).toBe(
        "participants"
    );
    expect(getByText(/3/i).getAttribute("aria-labelledby")).toBe("samples");
    expect(getByText(/4/i).getAttribute("aria-labelledby")).toBe("assays");
    expect(getByText(/5/i).getAttribute("aria-labelledby")).toBe("files");
    expect(getByText(/9.6 kb/i).getAttribute("aria-labelledby")).toBe("data");
});

it("renders logos for supporting organizations", () => {
    const { queryByAltText } = renderAsRouteComponent(HomePage);
    expect(queryByAltText("FNIH logo")).toBeInTheDocument();
    expect(queryByAltText("NCI logo")).toBeInTheDocument();
    expect(queryByAltText("PACT logo")).toBeInTheDocument();
});

test("'explore the data' button", () => {
    const { getByText } = renderAsRouteComponent(HomePage, { history });

    fireEvent.click(getByText(/explore the data/i));
    expect(history.location.pathname).toBe("/browse-data");
});
