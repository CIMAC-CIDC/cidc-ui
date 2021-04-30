import React from "react";
import { fireEvent } from "@testing-library/dom";
import { renderWithUserContext } from "../../../../test/helpers";
import { apiCreate } from "../../../api/api";
import BatchDownloadDialog from "./BatchDownloadDialog";

jest.mock("../../../api/api");

it("shows expected errors on filelist download click", async () => {
    const ids = [1, 2, 3];
    const { getByText, findByText } = renderWithUserContext(
        <BatchDownloadDialog ids={ids} token={"foo"} open />
    );

    // Check a "no files available" error
    apiCreate.mockRejectedValue({ response: { status: 404 } });
    fireEvent.click(getByText(/download filelist/i));
    expect(await findByText(/you don't have permission/i)).toBeInTheDocument();

    // Check a miscellaneous error
    apiCreate.mockRejectedValue({ response: { status: 500 } });
    fireEvent.click(getByText(/download filelist/i));
    expect(await findByText(/unexpected issue/i)).toBeInTheDocument();
});

it("shows expected errors on direct download click", async () => {
    const ids = [1, 2, 3];
    const { getByText, findByText } = renderWithUserContext(
        <BatchDownloadDialog ids={ids} token={"foo"} open />
    );

    const directDownloadButton = getByText(/download directly/i).closest(
        "button"
    )!;

    // Check a "no files available" error
    apiCreate.mockRejectedValue({ response: { status: 404 } });
    fireEvent.click(directDownloadButton);
    expect(await findByText(/you don't have permission/i)).toBeInTheDocument();

    // Check a miscellaneous error
    apiCreate.mockRejectedValue({ response: { status: 500 } });
    fireEvent.click(directDownloadButton);
    expect(await findByText(/unexpected issue/i)).toBeInTheDocument();

    // Check a "batch too large" error
    apiCreate.mockRejectedValue({ response: { status: 400 } });
    fireEvent.click(directDownloadButton);
    expect(await findByText(/more than 100MB/i)).toBeInTheDocument();
    expect(directDownloadButton.disabled).toBe(true);
});

it("shows an info message when a direct download is loading", async () => {
    apiCreate.mockImplementation(() => {
        // Sleep for 5 seconds
        return new Promise(resolve => setTimeout(() => resolve, 5000));
    });
    const ids = [1, 2, 3];
    const { getByText, findByText } = renderWithUserContext(
        <BatchDownloadDialog ids={ids} token={"foo"} open />
    );

    const directDownloadButton = getByText(/download directly/i).closest(
        "button"
    )!;
    fireEvent.click(directDownloadButton);
    expect(
        await findByText(/creating a compressed archive/i)
    ).toBeInTheDocument();
    expect(directDownloadButton.disabled).toBe(true);
});
