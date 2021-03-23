import * as React from "react";
import { range } from "lodash";
import { apiFetch, apiUpdate } from "../../api/api";
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
    role: "cimac-user",
    etag: String(id)
}));
const user = users[0];
const currentUser = users[users.length - 1];

beforeEach(() => {
    jest.clearAllMocks();
    apiFetch.mockResolvedValue({
        _items: users,
        _meta: { total: users.length }
    });
    apiUpdate.mockImplementation(
        async (url: string, token: string, config: any) => {
            return { ...user, ...config.data };
        }
    );
});

const waitForUserUpdates = async (data: Partial<Account>) => {
    await waitFor(() =>
        expect(apiUpdate).toHaveBeenCalledWith(
            `/users/${user.id}`,
            "test-token",
            { etag: user._etag, data }
        )
    );
};

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
    await waitForUserUpdates({ role: newRole });
});

test("disabling a user", async () => {
    const { findAllByRole } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );

    const disableToggle = (await findAllByRole("checkbox"))[0];

    // Disable the user
    fireEvent.click(disableToggle);
    await waitForUserUpdates({ disabled: true });
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
    await waitForUserUpdates({ contact_email: contactEmail });
});

test("editing a contact email", async () => {
    const oldContactEmail = "old@contact.email.com";
    const userWithContactEmail = {
        ...users[0],
        contact_email: oldContactEmail
    };
    apiFetch.mockResolvedValue({
        _items: [userWithContactEmail, ...users.slice(1)],
        _meta: { total: users.length }
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
    await waitForUserUpdates({ contact_email: newContactEmail });
});

test("downloading a data access report", async () => {
    const { getByText, findByText } = renderWithUserContext(
        <AdminUserManager />,
        currentUser
    );
    await findByText(users[0].email!);

    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new ArrayBuffer(8));

    const downloadButton = getByText(/download data access report/i).closest(
        "button"
    )!;
    fireEvent.click(downloadButton);

    expect(downloadButton.disabled).toBe(true);
    expect(apiFetch).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(downloadButton.disabled).toBe(false));
});
