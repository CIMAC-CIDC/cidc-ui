import React from "react";
import { createUser } from "../../api/api";
import { IAuthData, AuthContext } from "./AuthProvider";
import Register from "./Register";
import history from "./History";
import { render, fireEvent } from "@testing-library/react";
jest.mock("../../api/api");

const renderRegister = (authData?: IAuthData) => {
    return render(
        <AuthContext.Provider value={authData}>
            <Register />
        </AuthContext.Provider>
    );
};

it("renders progress indicator when no auth data has loaded", () => {
    const { queryByTestId } = renderRegister();
    expect(queryByTestId("loader")).toBeInTheDocument();
});

it("works as expected when auth data is provided", async () => {
    const idToken = "test-token";
    const user = {
        first_n: "John",
        last_n: "Doe",
        email: "test@example.com"
    };

    createUser.mockImplementation(async (t: string, u: any) => {
        expect(t).toBe(idToken);
        expect(u).toEqual({ ...user, organization: "STANFORD" });
    });

    const { findByDisplayValue, getByText } = renderRegister({
        user,
        idToken
    });
    expect(await findByDisplayValue(/john/i)).toBeInTheDocument();
    expect(await findByDisplayValue(/doe/i)).toBeInTheDocument();
    expect(await findByDisplayValue(/test@example\.com/i)).toBeInTheDocument();

    // submission without a selected organization blocks form submission
    fireEvent.click(getByText(/register/i));
    expect(createUser).not.toHaveBeenCalled();

    // select an organization
    fireEvent.mouseDown(getByText(/please select/i));
    fireEvent.click(getByText(/Stanford Cancer Institute/i));

    // submission works once all fields have values
    fireEvent.click(getByText(/register/i));
    expect(createUser).toHaveBeenCalled();
});
