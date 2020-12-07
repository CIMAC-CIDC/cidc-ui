import * as React from "react";
import { range } from "lodash";
import { getUsers } from "../../api/api";
import { Account } from "../../model/account";
import { renderWithUserContext } from "../../../test/helpers";
import AdminUserManager from "./AdminUserManager";
jest.mock("../../api/api");

const users: Array<Partial<Account>> = range(0, 15).map(id => ({
    id,
    email: `${id}@test.com`,
    first_n: `first_${id}`,
    last_n: `last_${id}`,
    organization: "DFCI",
    disabled: !!(id % 2),
    role: "cimac-user"
}));
const currentUser = users[users.length - 1];

beforeEach(() => {
    getUsers.mockResolvedValue({ data: users, meta: { total: users.length } });
});

it("renders all users", async () => {
    const { queryByText, findByText } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );
    expect(await findByText(users[0].email!)).toBeInTheDocument();

    users.forEach(user => {
        if (user === currentUser) {
            expect(queryByText(user.email!)).not.toBeInTheDocument();
        } else {
            expect(queryByText(user.email!)).toBeInTheDocument();
        }
    });
});
