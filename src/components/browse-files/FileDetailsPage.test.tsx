import React from "react";
import { getSingleFile, getDownloadURL } from "../../api/api";
import FileDetailsPage from "./FileDetailsPage";
import { renderAsRouteComponent } from "../../../test/helpers";
jest.mock("../../api/api");

const idToken = "test-token";
const file = {
    object_url: "some/url",
    trial_id: "test-trial-id",
    upload_type: "wes",
    file_ext: "bam",
    file_size_bytes: 100,
    uploaded_timestamp: Date.now()
};

it("renders a loader at first", () => {
    const { queryByTestId } = renderAsRouteComponent(FileDetailsPage);
    expect(queryByTestId("loader")).toBeInTheDocument();
});
