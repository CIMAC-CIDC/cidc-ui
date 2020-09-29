import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
    grantPermission,
    revokePermission,
    getPermissionsForUser,
    getTrials
} from "../../api/api";
import { Account } from "../../model/account";
import { Trial } from "../../model/trial";
import { InfoContext } from "../info/InfoProvider";
import UserPermissionsDialogWithInfo from "./AdminUserPermissionsDialog";
import { UserContext } from "../identity/UserProvider";
import { getNativeCheckbox } from "../../../test/helpers";
jest.mock("../../api/api");

const TOKEN = "test-token";
const GRANTER = { id: 1, email: "test-email-1" } as Account;
const GRANTEE = { id: 2, email: "test-email-2" } as Account;
const TRIAL = { trial_id: "test-1" } as Trial;
const TRIALS = [TRIAL];
const WES_PERMISSION = {
    id: 123,
    granted_to_user: GRANTEE.id,
    trial_id: "test-1",
    upload_type: "wes"
};
const PERMISSIONS = [
    WES_PERMISSION,
    {
        granted_to_user: GRANTEE.id,
        trial_id: TRIAL.trial_id,
        upload_type: "olink"
    }
];

getTrials.mockResolvedValue(TRIALS);
getPermissionsForUser.mockResolvedValue(PERMISSIONS);

function doRender() {
    const infoContext = {
        supportedTemplates: {
            assays: ["cytof", "wes", "rna", "olink", "ihc", "elisa", "mif"],
            manifests: [],
            analyses: []
        },
        extraDataTypes: []
    };

    return render(
        <InfoContext.Provider value={infoContext}>
            <UserContext.Provider value={GRANTER}>
                <UserPermissionsDialogWithInfo
                    token={TOKEN}
                    grantee={GRANTEE}
                    open={true}
                    onCancel={jest.fn()}
                />
            </UserContext.Provider>
        </InfoContext.Provider>
    );
}

it("renders existing permissions", async () => {
    const { findByTestId } = doRender();

    // Check that the permissions the user has been granted show up as checked
    for (const perm of PERMISSIONS) {
        const testId = `checkbox-${perm.trial_id}-${perm.upload_type}`;
        const checkbox = await findByTestId(testId);
        expect(checkbox).toBeInTheDocument();
        expect(getNativeCheckbox(checkbox).checked).toBe(true);
    }
});

it("handles permissions granting", async done => {
    const { findByTestId } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-cytof`;

    // User doesn't have this permission, so box should be unchecked
    const muiCheckbox = await findByTestId(checkboxId);
    const nativeCheckbox = getNativeCheckbox(muiCheckbox);
    expect(nativeCheckbox.checked).toBe(false);

    // Check expected call to grantPermission
    grantPermission.mockImplementation(
        (token, granter, grantee, trial, assay) => {
            expect([token, granter, grantee, trial, assay]).toEqual([
                TOKEN,
                GRANTER.id,
                GRANTEE.id,
                TRIAL.trial_id,
                "cytof"
            ]);
            return Promise.resolve(done());
        }
    );

    // Grant permission to the user
    fireEvent.click(nativeCheckbox);
});

it("handles permission revocation", async done => {
    const { findByTestId } = doRender();
    // User has permission to view wes for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-wes`;

    // User has this permission, so box should be checked
    const muiCheckbox = await findByTestId(checkboxId);
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
