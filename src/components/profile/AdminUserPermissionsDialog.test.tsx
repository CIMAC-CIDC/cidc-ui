import * as React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { apiCreate, apiDelete, apiFetch } from "../../api/api";
import { Account } from "../../model/account";
import { Trial } from "../../model/trial";
import { InfoContext } from "../info/InfoProvider";
import UserPermissionsDialogWithInfo from "./AdminUserPermissionsDialog";
import { UserContext } from "../identity/UserProvider";
import { getNativeCheckbox, renderWithSWR } from "../../../test/helpers";
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
    upload_type: "wes",
    _etag: "test-etag"
};
const PERMISSIONS = [
    WES_PERMISSION,
    {
        granted_to_user: GRANTEE.id,
        trial_id: TRIAL.trial_id,
        upload_type: "olink"
    }
];

const INFO = {
    supportedTemplates: {
        assays: [
            "cytof",
            "wes",
            "rna",
            "olink",
            "ihc",
            "elisa",
            "mif",
            "tcr",
            "hande"
        ],
        manifests: [],
        analyses: []
    },
    extraDataTypes: []
};

const mockFetch = (trials = TRIALS, perms = PERMISSIONS) => {
    apiFetch.mockImplementation(async (url: string) => {
        if (url.includes("/trial_metadata")) {
            return { _items: trials, _meta: { total: trials.length } };
        }
        if (url.includes("/permissions")) {
            return { _items: perms, _meta: { total: perms.length } };
        }
    });
};

function doRender() {
    return renderWithSWR(
        <InfoContext.Provider value={INFO}>
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
    mockFetch();
    const { findByTestId } = doRender();

    // Check that the permissions the user has been granted show up as checked
    for (const perm of PERMISSIONS) {
        const testId = `checkbox-${perm.trial_id}-${perm.upload_type}`;
        const checkbox = await findByTestId(testId);
        expect(checkbox).toBeInTheDocument();
        expect(getNativeCheckbox(checkbox).checked).toBe(true);
    }
});

it("handles permissions granting", async () => {
    mockFetch();
    const { findByTestId } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-cytof`;

    // User doesn't have this permission, so box should be unchecked
    const muiCheckbox = await findByTestId(checkboxId);
    const nativeCheckbox = getNativeCheckbox(muiCheckbox);
    expect(nativeCheckbox.checked).toBe(false);

    // Grant permission to the user
    fireEvent.click(nativeCheckbox);
    await waitFor(() => {
        expect(apiCreate).toHaveBeenCalledWith("/permissions", TOKEN, {
            data: {
                granted_to_user: GRANTEE.id,
                granted_by_user: GRANTER.id,
                trial_id: TRIAL.trial_id,
                upload_type: "cytof"
            }
        });
    });
});

it("handles permission revocation", async () => {
    mockFetch();
    const { findByTestId } = doRender();
    // User has permission to view wes for this trial
    const checkboxId = `checkbox-${TRIAL.trial_id}-wes`;

    // User has this permission, so box should be checked
    const muiCheckbox = await findByTestId(checkboxId);
    const nativeCheckbox = getNativeCheckbox(muiCheckbox);
    expect(nativeCheckbox.checked).toBe(true);

    // Delete permission for the user
    fireEvent.click(nativeCheckbox);
    await waitFor(() => {
        expect(apiDelete).toHaveBeenCalledWith(
            `/permissions/${WES_PERMISSION.id}`,
            TOKEN,
            {
                etag: WES_PERMISSION._etag
            }
        );
    });
});

it("handles broad trial permissions", async () => {
    const trials = [TRIAL, { ...TRIAL, trial_id: "test-2" }];
    const perms = [
        { trial_id: TRIAL.trial_id, upload_type: null },
        { trial_id: null, upload_type: "ihc" }
    ];
    mockFetch(trials, perms);

    const { findByTestId, getByTestId } = doRender();

    // All IHC checkboxes are checked across trials
    expect(
        getNativeCheckbox(await findByTestId("checkbox-test-1-ihc")).checked
    ).toBe(true);
    expect(getNativeCheckbox(getByTestId("checkbox-test-2-ihc")).checked).toBe(
        true
    );

    // All upload types are checked for TRIAL.trial_id trial
    INFO.supportedTemplates.assays.map(assay => {
        expect(
            getNativeCheckbox(getByTestId(`checkbox-test-1-${assay}`)).checked
        ).toBe(true);
    });
});
