import React from "react";
import PrivacyAndSecurityPage from "./PrivacyAndSecurityPage";
import { render } from "@testing-library/react";

test("PrivacyAndSecurityPage renders without crashing", () => {
    const { queryByText } = render(<PrivacyAndSecurityPage />);
    expect(
        queryByText(/CIDC Portal Privacy and Security Notice/g)
    ).toBeInTheDocument();
});
