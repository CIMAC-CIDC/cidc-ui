import React from "react";
import { fireEvent } from "@testing-library/dom";
import { renderWithUserContext } from "../../../../test/helpers";
import { apiCreate } from "../../../api/api";
import BatchDownloadDialog from "./BatchDownloadDialog";

jest.mock("../../../api/api");

it("shows an error when users don't have download permissions", async () => {
    apiCreate.mockRejectedValue({ response: { status: 404 } });

    const ids = [1, 2, 3];
    const { getByText, findByText } = renderWithUserContext(
        <BatchDownloadDialog ids={ids} token={"foo"} open />
    );

    // Click the download button
    fireEvent.click(getByText(/download filelist/i));

    // Check that an error is displayed
    expect(await findByText(/you don't have permission/i)).toBeInTheDocument();
});
