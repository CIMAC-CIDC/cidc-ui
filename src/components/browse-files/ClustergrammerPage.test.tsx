import React from "react";
import ClustergrammerPage from "./ClustergrammerPage";
import clustergrammer from "../__data__/clustergrammerNetwork.json";
import history from "../identity/History";
import { fireEvent } from "@testing-library/react";
import { renderWithRouter } from "../../../test/helpers";

const file = {
    id: 1,
    object_url: "some/file/url"
};
const backButtonMessage = /back to file details/i;
const cantVisualizeMessage = /cannot be visualized with clustergrammer/i;

it("handles files that can't be viewed with clustergrammer", () => {
    const { queryByText } = renderWithRouter(
        // @ts-ignore
        <ClustergrammerPage file={file} history={history} />
    );
    expect(queryByText(cantVisualizeMessage)).toBeInTheDocument();
    expect(queryByText(backButtonMessage)).toBeInTheDocument();
});

it("handles files that *can* be viewed with clustergrammer", () => {
    const fileWithCG = { ...file, clustergrammer };
    const { queryByText } = renderWithRouter(
        // @ts-ignore
        <ClustergrammerPage file={fileWithCG} history={history} />
    );
    expect(queryByText(/clustergrammer heatmap for/i)).toBeInTheDocument();
    expect(queryByText(new RegExp(file.object_url, "i"))).toBeInTheDocument();
    expect(queryByText(cantVisualizeMessage)).not.toBeInTheDocument();
    expect(queryByText(backButtonMessage)).toBeInTheDocument();
});

it("goes back to file details when the back button is clicked", () => {
    const { getByText } = renderWithRouter(
        // @ts-ignore
        <ClustergrammerPage file={file} history={history} />
    );
    fireEvent.click(getByText(backButtonMessage));
    expect(history.location.pathname).toBe(`/browse-files/1`);
});
