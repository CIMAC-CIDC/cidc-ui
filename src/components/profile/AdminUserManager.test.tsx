import * as React from "react";
import { range } from "lodash";
import { getUserEtag, getUsers, updateUser } from "../../api/api";
import { Account } from "../../model/account";
import { renderWithUserContext } from "../../../test/helpers";
import AdminUserManager from "./AdminUserManager";
import { fireEvent, waitFor } from "@testing-library/react";
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
const user = users[0];
const currentUser = users[users.length - 1];

beforeEach(() => {
    getUsers.mockResolvedValue({ data: users, meta: { total: users.length } });
    getUserEtag.mockResolvedValue("test-etag");
    updateUser.mockImplementation(async (t, i, e, updates) => {
        return { ...user, updates };
    });
});

it("renders all users", async () => {
    const { queryByText, findByText } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );
    expect(await findByText(users[0].email!)).toBeInTheDocument();

    users.forEach(u => {
        if (u === currentUser) {
            expect(queryByText(u.email!)).not.toBeInTheDocument();
        } else {
            expect(queryByText(u.email!)).toBeInTheDocument();
        }
    });
});

test("role update selection", async () => {
    const newRole = "cidc-admin";

    const { findAllByText, getByText } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );
    const roleSelect = (await findAllByText(user.role!))[0];

    // Change the user's role to cidc-admin
    fireEvent.mouseDown(roleSelect);
    fireEvent.click(getByText(newRole));
    waitFor(() =>
        expect(updateUser).toHaveReturnedWith({ ...user, role: newRole })
    );
});

test("disabling a user", async () => {
    const { findAllByTitle } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );

    const disableToggle = (await findAllByTitle(/disable this account/i))[0];

    // Disable the user
    fireEvent.click(disableToggle);
    waitFor(() =>
        expect(updateUser).toHaveReturnedWith({ ...user, disabled: true })
    );

    // Re-enable the user
    fireEvent.click(disableToggle);
    waitFor(() => expect(updateUser).toHaveLastReturnedWith(user));
});

test("adding and editing a contact email", async () => {
    const {
        findAllByText,
        findByTitle,
        getByPlaceholderText,
        findByText
    } = renderWithUserContext(<AdminUserManager />, currentUser);

    const enterEmail = (email: string) => {
        const emailInput = getByPlaceholderText(/add a contact email/i);
        fireEvent.input(emailInput, {
            target: { value: email }
        });
        fireEvent.submit(emailInput);
        waitFor(() =>
            expect(updateUser).toHaveLastReturnedWith({
                ...user,
                contact_email: email
            })
        );
    };

    // Add a new contact email
    const contactEmail = "some@contact.email.com";
    const addButton = (await findAllByText(/add a contact email/i))[0];
    fireEvent.click(addButton);
    enterEmail(contactEmail);
    expect(await findByText(contactEmail)).toBeInTheDocument();

    // Updating an existing contact email
    const newContactEmail = "new@contact.email.com";
    const editButton = await findByTitle(/edit contact email/i);
    fireEvent.click(editButton);
    enterEmail(newContactEmail);
    expect(await findByText(newContactEmail)).toBeInTheDocument();
});
