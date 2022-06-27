import React from "react";
import { fireEvent } from "@testing-library/react";
import history from "../identity/History";
import DataExplorationPage from "./DataExplorationPage";
import { renderAsRouteComponent } from "../../../test/helpers";
import { useUserContext } from "../identity/UserProvider";

jest.mock("../identity/UserProvider");

beforeEach(() => {
    useUserContext.mockImplementation(() => ({ canDownload: true }));
});

test("interactive / code-based view toggle", async () => {
    const {
        findByText,
        queryByText,
        getByText
    } = renderAsRouteComponent(DataExplorationPage, { history });
    const interactiveViewText = /Interactive view based on filtering with on-screen controls/i;
    const codeBasedViewText = /More in-depth, code-based exploration using Colaboratory/i;

    // Interactive view renders first by default
    expect(history.location.search).not.toContain("code_view=1");
    expect(await findByText(interactiveViewText)).toBeInTheDocument();
    expect(queryByText(codeBasedViewText)).not.toBeInTheDocument();

    // Toggle view to code view
    fireEvent.click(getByText(/code-based view/i));
    expect(history.location.search).toContain("code_view=1");
    expect(await findByText(codeBasedViewText)).toBeInTheDocument();
    expect(queryByText(interactiveViewText)).not.toBeInTheDocument();

    // Toggle view back to interactive view
    fireEvent.click(getByText(/interactive view/i));
    expect(history.location.search).not.toContain("code_view=1");
    expect(await findByText(interactiveViewText)).toBeInTheDocument();
    expect(queryByText(codeBasedViewText)).not.toBeInTheDocument();
});
