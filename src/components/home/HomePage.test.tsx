import HomePage from "./HomePage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { getDataOverview, IDataOverview } from "../../api/api";
import history from "../identity/History";
import { fireEvent } from "@testing-library/react";
import { cleanup } from "@testing-library/react-hooks";
jest.mock("../../api/api");

const dataOverview: IDataOverview = {
    num_trials: "trials-count",
    num_participants: "participants-count",
    num_samples: "samples-count",
    num_assays: "assays-count",
    num_files: "files-count",
    num_bytes: 1
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
    expect(
        (await findByText(/trials-count/i))!.getAttribute("aria-labelledby")
    ).toBe("trials");
    expect(
        getByText(/participants-count/i).getAttribute("aria-labelledby")
    ).toBe("participants");
    expect(getByText(/samples-count/i).getAttribute("aria-labelledby")).toBe(
        "samples"
    );
    expect(getByText(/assays-count/i).getAttribute("aria-labelledby")).toBe(
        "assays"
    );
    expect(getByText(/files-count/i).getAttribute("aria-labelledby")).toBe(
        "files"
    );
    expect(getByText(/1 b/i).getAttribute("aria-labelledby")).toBe("data");
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

test("data sizes are rounded correctly", async () => {
    getDataOverview.mockResolvedValue({
        ...dataOverview,
        num_bytes: 9.99123e11
    });
    const roundedGb = renderAsRouteComponent(HomePage);
    expect(await roundedGb.findByText(/999 gb/i)).toBeInTheDocument();
    cleanup();

    getDataOverview.mockResolvedValue({
        ...dataOverview,
        num_bytes: 1.23e12
    });
    const decimalTb = renderAsRouteComponent(HomePage);
    expect(await decimalTb.findByText(/1.2 tb/i)).toBeInTheDocument();
});
