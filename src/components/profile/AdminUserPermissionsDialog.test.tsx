import * as React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { apiCreate, apiDelete, apiFetch } from "../../api/api";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
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
// @ts-ignore because missing `granted_by_user` fields
const WES_FASTQ_PERMISSION: Permission = {
    id: 123,
    granted_to_user: GRANTEE.id,
    trial_id: "test-1",
    upload_type: "wes_fastq",
    _etag: "test-etag-fastq"
};
// @ts-ignore because missing `granted_by_user` fields
const WES_BAM_PERMISSION: Permission = {
    id: 456,
    granted_to_user: GRANTEE.id,
    trial_id: "test-1",
    upload_type: "wes_bam",
    _etag: "test-etag-bam"
};
const PERMISSIONS: Permission[] = [
    WES_FASTQ_PERMISSION,
    WES_BAM_PERMISSION,
    // @ts-ignore because missing `id`, `_etag`, `granted_by_user` fields
    {
        granted_to_user: GRANTEE.id,
        trial_id: TRIAL.trial_id,
        upload_type: "olink"
    }
];
const INFO = {
    supportedTemplates: {
        assays: [
            "atacseq_fastq",
            "clinical_data",
            "ctdna",
            "cytof",
            "elisa",
            "hande",
            "ihc",
            "microbiome",
            "mif",
            "misc_data",
            "nanostring",
            "olink",
            "rna_fastq",
            "rna_bam",
            "tcr_adaptive",
            "tcr_fastq",
            "wes_fastq",
            "wes_bam"
        ],
        manifests: [
            "h_and_e",
            "microbiome_dna",
            "normal_blood_dna",
            "normal_tissue_dna",
            "participants_annotations",
            "pbmc",
            "plasma",
            "tissue_slide",
            "tumor_tissue_dna",
            "tumor_tissue_rna",
            "tumor_normal_pairing"
        ],
        analyses: [
            "atacseq_analysis",
            "ctdna_analysis",
            "cytof_analysis",
            "rna_level1_analysis",
            "tcr_analysis",
            "wes_analysis",
            "wes_tumor_only_analysis",
            "microbiome_analysis"
        ]
    },
    extraDataTypes: ["participants info", "samples info"]
};
const mockFetch = (trials = TRIALS, perms = PERMISSIONS) => {
    apiCreate.mockImplementation(async (url: string) => undefined);
    apiDelete.mockImplementation(async (url: string) => undefined);
    apiCreate.mockClear();
    apiDelete.mockClear();
    apiFetch.mockImplementation(async (url: string) => {
        if (url.includes("/trial_metadata")) {
            return { _items: trials, _meta: { total: trials.length } };
        }
        if (url.includes("/permissions")) {
            let permsToReturn: Permission[] = perms;
            apiCreate.mock.calls.forEach(call => {
                const data = call[2].data;
                permsToReturn = [...permsToReturn, ...data];
            });
            apiDelete.mock.calls.forEach(call => {
                const data = call[2].data;
                const filterList: string[] = data.map(q =>
                    String([q.trial_id, q.upload_type])
                );
                permsToReturn = permsToReturn.filter(
                    p =>
                        !filterList.includes(
                            String([p.trial_id, p.upload_type])
                        )
                );
            });
            return {
                _items: permsToReturn,
                _meta: { total: permsToReturn.length }
            };
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
    const { findByTestId, getByText } = doRender();
    // Check that the permissions the user has been granted show up as checked
    for (const perm of PERMISSIONS) {
        const testId = `checkbox-${perm.trial_id}-${perm.upload_type}`;
        const checkbox = await findByTestId(testId);
        expect(checkbox).toBeInTheDocument();
        expect(getNativeCheckbox(checkbox).checked).toBe(true);
    }
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
});
it("handles permission click and unclick", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toClickCheckboxId = `checkbox-${TRIAL.trial_id}-cytof`;
    // User does have this permission, so box should be checked
    const alreadyHasNativeCheckbox = getNativeCheckbox(
        await findByTestId(alreadyHasCheckboxId)
    );
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveNativeCheckbox = getNativeCheckbox(
        await findByTestId(doesntHaveCheckboxId)
    );
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    const toClickNativeCheckbox = getNativeCheckbox(
        await findByTestId(toClickCheckboxId)
    );
    expect(toClickNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Click permission
    fireEvent.click(toClickNativeCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    expect(toClickNativeCheckbox.checked).toBe(true);
    // Then unclick it
    fireEvent.click(toClickNativeCheckbox);
    await waitFor(() => {
        expect(toClickNativeCheckbox.checked).toBe(false);
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(true);
});
it("handles permission unclick and reclick", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User has permission to view wes for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-olink`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toUnclickCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    // User does have these permissions, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    const toUnclickMuiCheckbox = await findByTestId(toUnclickCheckboxId);
    const toUnclickNativeCheckbox = getNativeCheckbox(toUnclickMuiCheckbox);
    expect(toUnclickNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Unclick permission
    fireEvent.click(toUnclickNativeCheckbox);
    expect(toUnclickNativeCheckbox.checked).toBe(false);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    // Reclick permission
    fireEvent.click(toUnclickNativeCheckbox);
    expect(toUnclickNativeCheckbox.checked).toBe(true);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(true);
});
it("handles permissions granting", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toGrantCheckboxId = `checkbox-${TRIAL.trial_id}-cytof`;
    // User does have this permission, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    const toGrantMuiCheckbox = await findByTestId(toGrantCheckboxId);
    const toGrantNativeCheckbox = getNativeCheckbox(toGrantMuiCheckbox);
    expect(toGrantNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Mark permissions for granting
    fireEvent.click(toGrantNativeCheckbox);
    expect(toGrantNativeCheckbox.checked).toBe(true);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    // Grant permission to the user
    act(() => {
        fireEvent.click(submitButton);
    });
    expect(apiCreate).toHaveBeenCalledWith("/permissions", TOKEN, {
        data: [
            {
                granted_to_user: GRANTEE.id,
                granted_by_user: GRANTER.id,
                trial_id: TRIAL.trial_id,
                upload_type: "cytof"
            }
        ]
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox.checked).toBe(true);
    expect(submitButton.disabled).toBe(true);
});
it("handles multiple permissions granting", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User doesn't yet have permission to view cytof for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toGrantCheckboxId1 = `checkbox-${TRIAL.trial_id}-cytof`;
    const toGrantCheckboxId2 = `checkbox-${TRIAL.trial_id}-cytof_analysis`;
    // User does have this permission, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    const toGrantMuiCheckbox1 = await findByTestId(toGrantCheckboxId1);
    const toGrantNativeCheckbox1 = getNativeCheckbox(toGrantMuiCheckbox1);
    expect(toGrantNativeCheckbox1.checked).toBe(false);
    const toGrantMuiCheckbox2 = await findByTestId(toGrantCheckboxId2);
    const toGrantNativeCheckbox2 = getNativeCheckbox(toGrantMuiCheckbox2);
    expect(toGrantNativeCheckbox2.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Mark permissions for granting
    fireEvent.click(toGrantNativeCheckbox1);
    expect(toGrantNativeCheckbox1.checked).toBe(true);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox2.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(toGrantNativeCheckbox2);
    expect(toGrantNativeCheckbox2.checked).toBe(true);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox1.checked).toBe(true);
    expect(submitButton.disabled).toBe(false);
    // Grant permission to the user

    act(() => {
        fireEvent.click(submitButton);
    });
    expect(apiCreate).toHaveBeenCalledWith("/permissions", TOKEN, {
        data: [
            {
                granted_to_user: GRANTEE.id,
                granted_by_user: GRANTER.id,
                trial_id: TRIAL.trial_id,
                upload_type: "cytof"
            },
            {
                granted_to_user: GRANTEE.id,
                granted_by_user: GRANTER.id,
                trial_id: TRIAL.trial_id,
                upload_type: "cytof_analysis"
            }
        ]
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox1.checked).toBe(true);
    expect(toGrantNativeCheckbox2.checked).toBe(true);
    expect(submitButton.disabled).toBe(true);
});
it("handles permission revocation", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User has permission to view wes for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-olink`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toRemoveCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    // User does have these permissions, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    const toRemoveMuiCheckbox = await findByTestId(toRemoveCheckboxId);
    const toRemoveNativeCheckbox = getNativeCheckbox(toRemoveMuiCheckbox);
    expect(toRemoveNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Mark permissions for revoking
    fireEvent.click(toRemoveNativeCheckbox);
    expect(toRemoveNativeCheckbox.checked).toBe(false);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    // Delete permission for the user
    act(() => {
        fireEvent.click(submitButton);
    });
    expect(apiDelete).toHaveBeenCalledWith(`/permissions`, TOKEN, {
        data: [WES_FASTQ_PERMISSION]
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toRemoveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(true);
});
it("handles multiple permission revocation", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User has permission to view wes for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-olink`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toRemoveCheckboxId1 = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    const toRemoveCheckboxId2 = `checkbox-${TRIAL.trial_id}-wes_bam`;
    // User does have these permissions, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    const toRemoveMuiCheckbox1 = await findByTestId(toRemoveCheckboxId1);
    const toRemoveNativeCheckbox1 = getNativeCheckbox(toRemoveMuiCheckbox1);
    expect(toRemoveNativeCheckbox1.checked).toBe(true);
    const toRemoveMuiCheckbox2 = await findByTestId(toRemoveCheckboxId2);
    const toRemoveNativeCheckbox2 = getNativeCheckbox(toRemoveMuiCheckbox2);
    expect(toRemoveNativeCheckbox2.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Mark permissions for granting
    fireEvent.click(toRemoveNativeCheckbox1);
    expect(toRemoveNativeCheckbox1.checked).toBe(false);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toRemoveNativeCheckbox2.checked).toBe(true);
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(toRemoveNativeCheckbox2);
    expect(toRemoveNativeCheckbox2.checked).toBe(false);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toRemoveNativeCheckbox1.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);
    // Delete permission for the user
    act(() => {
        fireEvent.click(submitButton);
    });
    expect(apiDelete).toHaveBeenCalledWith(`/permissions`, TOKEN, {
        data: [WES_FASTQ_PERMISSION, WES_BAM_PERMISSION]
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toRemoveNativeCheckbox1.checked).toBe(false);
    expect(toRemoveNativeCheckbox2.checked).toBe(false);
    expect(submitButton.disabled).toBe(true);
});
it("handles simultaneous permission granting and revocation", async () => {
    mockFetch();
    const { findByTestId, getByText } = doRender();
    // User has permission to view wes for this trial
    const alreadyHasCheckboxId = `checkbox-${TRIAL.trial_id}-olink`;
    const doesntHaveCheckboxId = `checkbox-${TRIAL.trial_id}-ihc`;
    const toGrantCheckboxId = `checkbox-${TRIAL.trial_id}-cytof`;
    const toRemoveCheckboxId = `checkbox-${TRIAL.trial_id}-wes_fastq`;
    // User does have these permissions, so box should be checked
    const alreadyHasMuiCheckbox = await findByTestId(alreadyHasCheckboxId);
    const alreadyHasNativeCheckbox = getNativeCheckbox(alreadyHasMuiCheckbox);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    const toRemoveMuiCheckbox = await findByTestId(toRemoveCheckboxId);
    const toRemoveNativeCheckbox = getNativeCheckbox(toRemoveMuiCheckbox);
    expect(toRemoveNativeCheckbox.checked).toBe(true);
    // User doesn't have these permissions, so box should be unchecked
    const doesntHaveMuiCheckbox = await findByTestId(doesntHaveCheckboxId);
    const doesntHaveNativeCheckbox = getNativeCheckbox(doesntHaveMuiCheckbox);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    const toGrantMuiCheckbox = await findByTestId(toGrantCheckboxId);
    const toGrantNativeCheckbox = getNativeCheckbox(toGrantMuiCheckbox);
    expect(toGrantNativeCheckbox.checked).toBe(false);
    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    // Mark permissions for granting
    fireEvent.click(toGrantNativeCheckbox);
    expect(toGrantNativeCheckbox.checked).toBe(true);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toRemoveNativeCheckbox.checked).toBe(true);
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(toRemoveNativeCheckbox);
    expect(toRemoveNativeCheckbox.checked).toBe(false);
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox.checked).toBe(true);
    expect(submitButton.disabled).toBe(false);
    // Delete permission for the user
    act(() => {
        fireEvent.click(submitButton);
    });
    expect(apiCreate).toHaveBeenCalledWith("/permissions", TOKEN, {
        data: [
            {
                granted_to_user: GRANTEE.id,
                granted_by_user: GRANTER.id,
                trial_id: TRIAL.trial_id,
                upload_type: "cytof"
            }
        ]
    });
    expect(apiDelete).toHaveBeenCalledWith(`/permissions`, TOKEN, {
        data: [WES_FASTQ_PERMISSION]
    });
    expect(alreadyHasNativeCheckbox.checked).toBe(true);
    expect(doesntHaveNativeCheckbox.checked).toBe(false);
    expect(toGrantNativeCheckbox.checked).toBe(true);
    expect(toRemoveNativeCheckbox.checked).toBe(false);
    expect(submitButton.disabled).toBe(true);
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
    // All upload types are checked and disabled for TRIAL.trial_id trial
    // except clinical_data, which should be unchecked and enabled
    INFO.supportedTemplates.assays.map(assay => {
        if (assay !== "clinical_data") {
            expect(
                getNativeCheckbox(getByTestId(`checkbox-test-1-${assay}`))
                    .checked
            ).toBe(true);
            expect(
                getNativeCheckbox(getByTestId(`checkbox-test-1-${assay}`))
                    .disabled
            ).toBe(true);
        } else {
            expect(
                getNativeCheckbox(getByTestId(`checkbox-test-1-${assay}`))
                    .checked
            ).toBe(false);
            expect(
                getNativeCheckbox(getByTestId(`checkbox-test-1-${assay}`))
                    .disabled
            ).toBe(false);
        }
    });
});
