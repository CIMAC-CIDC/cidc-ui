import React from "react";
import networkData from "../__data__/clustergrammerNetwork.json";
import { render, waitFor } from "@testing-library/react";
import ClustergrammerCard, { Clustergrammer } from "./ClustergrammerCard";
import useRawFile from "../../util/useRawFile";
import { Box } from "@material-ui/core";
jest.mock("../../util/useRawFile");

useRawFile.mockImplementation(() => {
    return `<html><head></head><body></body></html>`;
});

describe("Clustergrammer", () => {
    it("loads an iframe", async () => {
        const { container } = render(
            <Clustergrammer networkData={networkData} />,
            { container: document.createElement("div") }
        );

        const iframe = await waitFor(() => container.querySelector("iframe"));
        expect(iframe).not.toBe(null);
    });
});

describe("ClustergrammerCard", () => {
    const file = {
        id: 1,
        object_url: "some/file/url"
    };
    const cantVisualizeMessage = /cannot be visualized with clustergrammer/i;

    it("handles files that can't be viewed with clustergrammer", () => {
        const { queryByText } = render(
            // @ts-ignore
            <ClustergrammerCard file={file} />
        );
        expect(queryByText(cantVisualizeMessage)).toBeInTheDocument();
    });

    it("handles files that *can* be viewed with clustergrammer", () => {
        const fileWithCG = { ...file, clustergrammer: { foo: "bar" } };
        const { queryByText } = render(
            // @ts-ignore
            <ClustergrammerCard file={fileWithCG} />,
            { container: document.createElement("div") }
        );
        expect(queryByText(cantVisualizeMessage)).not.toBeInTheDocument();
    });
});
