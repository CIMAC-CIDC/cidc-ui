import * as React from "react";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import {
    grantPermission,
    revokePermission,
    getPermissions,
    getTrials
} from "../../api/api";
import { Account } from "../../model/account";
import { Trial } from "../../model/trial";
import { InfoContext } from "../info/InfoProvider";
import UserPermissionsDialogWithInfo from "./UserPermissionsDialog";
jest.mock("../../api/api");

const TOKEN = "test-token";
const USER = { id: 1, email: "test-email" } as Account;
const TRIAL = { trial_id: "test-1" } as Trial;
const TRIALS = [TRIAL];
const WES_PERMISSION = {
    id: 123,
    to_user: USER.id,
    trial: "test-1",
    assay_type: "wes"
};
const PERMISSIONS = [
    WES_PERMISSION,
    { to_user: USER.id, trial: "test-1", assay_type: "olink" }
];

getTrials.mockResolvedValue(TRIALS);
getPermissions.mockResolvedValue(PERMISSIONS);

function doRender() {
    const infoContext = {
        supportedTemplates: {
            metadata: ["cytof", "wes", "olink"],
            manifests: []
        },
        extraDataTypes: []
    };

    return render(
        <InfoContext.Provider value={infoContext}>
            <UserPermissionsDialogWithInfo
                token={TOKEN}
                user={USER}
                open={true}
                onCancel={jest.fn()}
            />
        </InfoContext.Provider>
    );
}

function getNativeCheckbox(muiCheckbox): HTMLInputElement {
    return muiCheckbox.querySelector('input[type="checkbox"]');
}

it("renders existing permissions", async () => {
    const { getByTestId } = doRender();

    // Check that the permissions the user has been granted show up as checked
    for (const perm of PERMISSIONS) {
        const testId = `checkbox-${perm.trial}-${perm.assay_type}`;
        const checkbox = await waitForElement(() => getByTestId(testId));
        expect(checkbox).toBeInTheDocument();
        expect(getNativeCheckbox(checkbox).checked).toBe(true);
    }
});

it("handles permissions granting", async done => {
    const { getByTestId } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-cytof`;

    // User doesn't have this permission, so box should be unchecked
    const muiCheckbox = await waitForElement(() => getByTestId(checkboxId));
    const nativeCheckbox = getNativeCheckbox(muiCheckbox);
    expect(nativeCheckbox.checked).toBe(false);

    // Check expected call to grantPermission
    grantPermission.mockImplementation((token, user, trial, assay) => {
        expect([token, user, trial, assay]).toEqual([
            TOKEN,
            USER,
            TRIAL.trial_id,
            "cytof"
        ]);
        return Promise.resolve(done());
    });

    // Grant permission to the user
    fireEvent.click(nativeCheckbox);
});

it("handles permission revocation", async done => {
    const { getByTestId } = doRender();
    // User has permission to view wes for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-wes`;

    // User has this permission, so box should be checked
    const muiCheckbox = await waitForElement(() => getByTestId(checkboxId));
    const nativeCheckbox = getNativeCheckbox(muiCheckbox);
    expect(nativeCheckbox.checked).toBe(true);

    // Check expected call to revokePermission
    revokePermission.mockImplementation((token, id) => {
        expect([token, id]).toEqual([TOKEN, WES_PERMISSION.id]);
        return Promise.resolve(done());
    });

    // Delete permission for the user
    fireEvent.click(nativeCheckbox);
});
