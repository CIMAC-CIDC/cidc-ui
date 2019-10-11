import * as React from "react";
import { render } from "@testing-library/react";
import { UserContext } from "./UserProvider";
import { Account } from "../model/account";
import Unactivated from "./Unactivated";
import history from "./History";

function renderWithProfile(profile: Account) {
    return render(
        <UserContext.Provider value={profile}>
            <Unactivated />
        </UserContext.Provider>
    );
}

const PROFILE: Account = {
    id: 1,
    _created: "",
    _updated: "",
    _etag: "",
    email: "",
    organization: "DFCI",
    disabled: false
};

it("displays to unregistered users", () => {
    history.push("/some-route");
    const { getByTestId } = renderWithProfile(PROFILE);
    expect(getByTestId("unactivated-message")).toBeInTheDocument();
});

it("redirects approved users to home", () => {
    history.push("/some-route");
    renderWithProfile({ ...PROFILE, approval_date: Date.now().toString() });
    expect(history.location.pathname).toBe("/");
});
