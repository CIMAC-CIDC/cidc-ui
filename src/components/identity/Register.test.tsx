import React from "react";
import { apiCreate } from "../../api/api";
import { IAuthData } from "./AuthProvider";
import Register from "./Register";
import { fireEvent } from "@testing-library/react";
import { renderAsRouteComponent } from "../../../test/helpers";
jest.mock("../../api/api");

const renderRegister = (authData?: IAuthData) => {
    return renderAsRouteComponent(Register, authData && { authData });
};

it("renders nothing when no auth data has loaded", () => {
    const { queryByText } = renderRegister({ state: "loading" });
    expect(queryByText(/sign up for the cidc portal/i)).not.toBeInTheDocument();
});

it("works as expected when auth data is provided", async () => {
    const idToken = "test-token";
    const user = {
        first_n: "John",
        last_n: "Doe",
        email: "test@example.com"
    };
    apiCreate.mockResolvedValue(user);

    const { findByDisplayValue, getByText } = renderRegister({
        state: "logged-in",
        userInfo: {
            user,
            idToken
        }
    });
    expect(await findByDisplayValue(/john/i)).toBeInTheDocument();
    expect(await findByDisplayValue(/doe/i)).toBeInTheDocument();
    expect(await findByDisplayValue(/test@example\.com/i)).toBeInTheDocument();

    // submission without a selected organization blocks form submission
    fireEvent.click(getByText(/register/i));
    expect(apiCreate).not.toHaveBeenCalled();

    // select an organization
    fireEvent.mouseDown(getByText(/please select/i));
    fireEvent.click(getByText(/Stanford Cancer Institute/i));

    // submission works once all fields have values
    fireEvent.click(getByText(/register/i));
    expect(apiCreate).toHaveBeenCalledWith("/users/self", idToken, {
        data: { ...user, organization: "STANFORD" }
    });
});
