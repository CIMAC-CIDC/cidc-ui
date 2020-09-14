import React from "react";
import networkData from "../__data__/clustergrammerNetwork.json";
import { render } from "@testing-library/react";
import Clustergrammer from "./Clustergrammer";
import useRawFile from "../../util/useRawFile";
jest.mock("../../util/useRawFile");

const successText = "loaded html successfully";
useRawFile.mockImplementation(() => {
    return `<html><head></head><body>${successText}</body></html>`;
});

it("loads an iframe", async () => {
    const container = document.createElement("div");
    const { baseElement } = render(
        <Clustergrammer networkData={networkData} />,
        { container }
    );

    const cgIframe = baseElement.childNodes[0];
    expect(cgIframe.nodeName).toBe("IFRAME");
});
