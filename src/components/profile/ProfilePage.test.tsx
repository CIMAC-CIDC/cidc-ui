import { RenderResult } from "@testing-library/react";
import React from "react";
import { renderWithUserContext } from "../../../test/helpers";
import { IAccountWithExtraContext } from "../identity/UserProvider";
import ProfilePage from "./ProfilePage";

const user: IAccountWithExtraContext = {
    role: "cimac-user",
    first_n: "john",
    last_n: "doe",
    email: "test@email.com",
    approval_date: "01/01/01",
    permissions: [
        { trial_id: "test-trial-1", upload_type: "wes" },
        { trial_id: "test-trial-2", upload_type: "cytof" },
        { trial_id: "test-trial-3", upload_type: null },
        { trial_id: null, upload_type: "ihc" }
    ]
};

const checkCoreDetails = (queryByText: RenderResult["queryByText"]) => {
    expect(queryByText(new RegExp(user.first_n, "i"))).toBeInTheDocument();
    expect(queryByText(new RegExp(user.last_n, "i"))).toBeInTheDocument();
    expect(queryByText(new RegExp(user.email, "i"))).toBeInTheDocument();
};

const trialAdmin = /manage trials/i;
const userAdmin = /manage users/i;

it("renders as expected for a non-admin and non-NCI user", () => {
    const { queryByText } = renderWithUserContext(<ProfilePage />, user);
    checkCoreDetails(queryByText);
    expect(queryByText(/test-trial-1 : wes/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-2 : cytof/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-3 : \[ALL DATA\]/i)).toBeInTheDocument();
    expect(queryByText(/\[ALL TRIALS\] : ihc/i)).toBeInTheDocument();

    // admin tools not rendered
    expect(queryByText(trialAdmin)).not.toBeInTheDocument();
    expect(queryByText(userAdmin)).not.toBeInTheDocument();
});

it("renders as expected for NCI users", () => {
    const nciUser = {
        ...user,
        role: "nci-biobank-user" as IAccountWithExtraContext["role"]
    };
    const { queryByText } = renderWithUserContext(<ProfilePage />, nciUser);
    checkCoreDetails(queryByText);
    expect(
        queryByText(/gives you access to all datasets/i)
    ).toBeInTheDocument();

    // admin tools not rendered
    expect(queryByText(trialAdmin)).not.toBeInTheDocument();
    expect(queryByText(userAdmin)).not.toBeInTheDocument();
});

it("renders as expected for admin users", () => {
    const nciUser = {
        ...user,
        role: "cidc-admin" as IAccountWithExtraContext["role"]
    };
    const { queryByText } = renderWithUserContext(<ProfilePage />, nciUser);
    checkCoreDetails(queryByText);
    expect(
        queryByText(/gives you access to all datasets/i)
    ).toBeInTheDocument();

    // admin tools rendered
    expect(queryByText(trialAdmin)).toBeInTheDocument();
    expect(queryByText(userAdmin)).toBeInTheDocument();
});
