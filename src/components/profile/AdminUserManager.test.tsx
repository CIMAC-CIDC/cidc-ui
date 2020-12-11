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
    jest.clearAllMocks();
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

const getUserUpdates = () => {
    return updateUser.mock.calls[0][3];
};

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
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(getUserUpdates()).toEqual({ role: newRole });
});

test("disabling a user", async () => {
    const { findAllByRole } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );

    const disableToggle = (await findAllByRole("checkbox"))[0];

    // Disable the user
    fireEvent.click(disableToggle);
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(getUserUpdates()).toEqual({ disabled: true });
});

test("adding a contact email", async () => {
    const { findAllByText, getByPlaceholderText } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );

    // Add a new contact email
    const contactEmail = "some@contact.email.com";
    const addButton = (await findAllByText(/add a contact email/i))[0];
    fireEvent.click(addButton);
    const emailInput = getByPlaceholderText(/add a contact email/i);
    fireEvent.input(emailInput, { target: { value: contactEmail } });
    fireEvent.submit(emailInput);

    // Check that updates were made
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(getUserUpdates()).toEqual({ contact_email: contactEmail });
});

test("editing a contact email", async () => {
    const oldContactEmail = "old@contact.email.com";
    const userWithContactEmail = {
        ...users[0],
        contact_email: oldContactEmail
    };
    getUsers.mockResolvedValue({
        data: [userWithContactEmail, ...users.slice(1)],
        meta: { total: users.length }
    });

    const {
        findByText,
        findByTitle,
        getByPlaceholderText
    } = renderWithUserContext(<AdminUserManager />, currentUser);

    expect(await findByText(oldContactEmail)).toBeInTheDocument();

    // Updating an existing contact email
    const newContactEmail = "new@contact.email.com";
    const editButton = await findByTitle(/edit contact email/i);
    fireEvent.click(editButton);
    const emailInput = getByPlaceholderText(/add a contact email/i);
    fireEvent.input(emailInput, { target: { value: newContactEmail } });
    fireEvent.submit(emailInput);
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(getUserUpdates()).toEqual({ contact_email: newContactEmail });
});
