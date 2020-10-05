import { Account } from "../model/account";
import { Trial, NewTrial } from "../model/trial";
import { DataFile } from "../model/file";
import axios, {
    AxiosInstance,
    AxiosResponse,
    AxiosError,
    CancelToken
} from "axios";
import Permission from "../model/permission";
import { IFacets } from "../components/browse-data/shared/FilterProvider";

const URL: string = process.env.REACT_APP_API_URL!;

function getApiClient(token?: string): AxiosInstance {
    return axios.create({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        baseURL: URL
    });
}

function _itemURL(endpoint: string, itemID: number): string {
    return `${endpoint}/${itemID}`;
}

function _extractItem<T>(response: AxiosResponse<T>): T {
    return response.data;
}

function _extractItems<T extends { _items: any[] }>(
    response: AxiosResponse<T>
): T["_items"] {
    return _extractItem(response)._items;
}

function _extractErrorMessage(error: AxiosError): never {
    const response = error.response;
    if (response && response.data) {
        if (response.data._status === "ERR") {
            throw response.data._error.message;
        } else {
            throw response.data.toString();
        }
    }
    throw error.toString();
}

function _getItem<T>(
    token: string,
    endpoint: string,
    itemID: number
): Promise<T> {
    return getApiClient(token)
        .get(_itemURL(endpoint, itemID))
        .then(_extractItem);
}

function _getItems<T>(token: string, endpoint: string): Promise<T[]> {
    return getApiClient(token)
        .get(endpoint)
        .then(_extractItems);
}

export interface IDataWithMeta<D> {
    data: D;
    meta: {
        total: number;
    };
}

function getFiles(
    token: string,
    params?: any,
    cancelToken?: CancelToken
): Promise<IDataWithMeta<DataFile[]>> {
    return getApiClient(token)
        .get("downloadable_files", { params, cancelToken })
        .then(res => {
            const { _items, _meta: meta } = _extractItem(res);
            return { data: _items, meta };
        });
}

function getSingleFile(
    token: string,
    itemID: number
): Promise<DataFile | undefined> {
    return _getItem<DataFile>(token, "downloadable_files", itemID);
}

function getRelatedFiles(token: string, fileId: number): Promise<DataFile[]> {
    return getApiClient(token)
        .get(`downloadable_files/${fileId}/related_files`)
        .then(_extractItems);
}

function getFilelist(token: string, fileIds: number[]): Promise<Blob> {
    return getApiClient(token)
        .get("downloadable_files/filelist", {
            params: { file_ids: fileIds.join(",") }
        })
        .then(
            ({ data }) =>
                new Blob([data], {
                    type: "text/tab-separated-values"
                })
        );
}

function getDownloadURL(
    token: string,
    fileID: string | number
): Promise<string> {
    return getApiClient(token)
        .get("downloadable_files/download_url", {
            params: { id: fileID }
        })
        .then(_extractItem);
}

function getAccountInfo(token: string): Promise<Account> {
    return getApiClient(token)
        .get("users/self")
        .then(_extractItem);
}

function getTrials(token: string, params: any = {}): Promise<Trial[]> {
    return getApiClient(token)
        .get("trial_metadata", {
            params: { sort_field: "trial_id", sort_direction: "asc", ...params }
        })
        .then(_extractItems);
}

function getTrial(token: string, trialId: number): Promise<Trial> {
    return _getItem<Trial>(token, "trial_metadata", trialId);
}

function createTrial(token: string, trial: NewTrial): Promise<Trial> {
    return getApiClient(token)
        .post("trial_metadata", trial)
        .then(_extractItem);
}

function updateTrialMetadata(
    token: string,
    etag: string,
    trial: Pick<Trial, "trial_id" | "metadata_json">
): Promise<Trial> {
    return getApiClient(token)
        .patch(
            `trial_metadata/${trial.trial_id}`,
            { metadata_json: trial.metadata_json },
            {
                headers: { "if-match": etag }
            }
        )
        .then(_extractItem);
}

function createUser(token: string, newUser: any): Promise<Account | undefined> {
    return getApiClient(token).post("users/self", newUser);
}

function getAllAccounts(token: string): Promise<Account[]> {
    return _getItems(token, "users");
}

function updateRole(
    token: string,
    itemID: number,
    etag: string,
    role: string
): Promise<Account> {
    return getApiClient(token)
        .patch(
            _itemURL("users", itemID),
            { role },
            { headers: { "if-match": etag } }
        )
        .then(_extractItem);
}

interface IManifestForm {
    schema: string;
    template: File;
}

function _makeManifestRequest<T>(
    endpoint: string,
    token: string,
    form: IManifestForm
): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append("schema", form.schema.toLowerCase());
    formData.append("template", form.template);

    return getApiClient(token)
        .post(endpoint, formData, {
            headers: { "content-type": "multipart/form" }
        })
        .catch(_extractErrorMessage);
}

interface IManifestUploadResponse {
    metadata_json_patch: { protocol_identifier: string };
}
function uploadManifest(
    token: string,
    form: IManifestForm
): Promise<IManifestUploadResponse> {
    return _makeManifestRequest<IManifestUploadResponse>(
        "ingestion/upload_manifest",
        token,
        form
    ).then(_extractItem);
}

function getManifestValidationErrors(
    token: string,
    form: IManifestForm
): Promise<string[] | undefined> {
    return _makeManifestRequest<{ errors: string[] }>(
        "ingestion/validate",
        token,
        form
    )
        .then(res => _extractItem(res).errors)
        .catch(error => error.errors || [error.toString()]);
}

function _getEtag<T extends { _etag: string }>(
    token: string,
    endpoint: string,
    itemID: number
) {
    return _getItem<T>(token, endpoint, itemID).then(item => item._etag);
}

function getUserEtag(token: string, userID: number): Promise<string> {
    return _getEtag<Account>(token, "users", userID);
}

function getPermissionsForUser(
    token: string,
    userID: number
): Promise<Permission[] | undefined> {
    return getApiClient(token)
        .get("permissions", {
            params: { user_id: userID }
        })
        .then(_extractItems);
}

function grantPermission(
    token: string,
    granterId: number,
    granteeId: number,
    trialId: string,
    uploadType: string
): Promise<any> {
    return getApiClient(token).post("permissions", {
        granted_to_user: granteeId,
        granted_by_user: granterId,
        trial_id: trialId,
        upload_type: uploadType
    });
}

function revokePermission(token: string, permissionID: number): Promise<any> {
    return _getEtag<Permission>(token, "permissions", permissionID).then(etag =>
        getApiClient(token).delete(`permissions/${permissionID}`, {
            headers: { "if-match": etag }
        })
    );
}

function getFilterFacets(token: string): Promise<IFacets> {
    return getApiClient(token)
        .get("downloadable_files/filter_facets")
        .then(_extractItem);
}

function getSupportedAssays(): Promise<string[]> {
    return getApiClient()
        .get("/info/assays")
        .then(_extractItem);
}

function getSupportedManifests(): Promise<string[]> {
    return getApiClient()
        .get("/info/manifests")
        .then(_extractItem);
}

function getSupportedAnalyses(): Promise<string[]> {
    return getApiClient()
        .get("/info/analyses")
        .then(_extractItem);
}

function getExtraDataTypes(): Promise<string[]> {
    return getApiClient()
        .get("/info/extra_data_types")
        .then(_extractItem);
}

export {
    _getItem,
    _getItems,
    _extractErrorMessage,
    _makeManifestRequest,
    getApiClient,
    getFiles,
    getSingleFile,
    getRelatedFiles,
    getFilelist,
    getDownloadURL,
    getAccountInfo,
    getTrials,
    getTrial,
    createTrial,
    updateTrialMetadata,
    createUser,
    getAllAccounts,
    updateRole,
    getUserEtag,
    uploadManifest,
    getManifestValidationErrors,
    getPermissionsForUser,
    grantPermission,
    revokePermission,
    getFilterFacets,
    getSupportedAssays,
    getSupportedManifests,
    getSupportedAnalyses,
    getExtraDataTypes
};
