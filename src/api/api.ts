import { Account } from "../model/account";
import { Trial } from "../model/trial";
import { DataFile } from "../model/file";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import Permission from "../model/permission";

const URL: string = process.env.REACT_APP_API_URL!;

function getApiClient(token?: string): AxiosInstance {
    return axios.create({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        baseURL: URL
    });
}

function _itemURL(endpoint: string, itemID: string): string {
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
    itemID: string | number
): Promise<T> {
    return getApiClient(token)
        .get(_itemURL(endpoint, itemID.toString()))
        .then(_extractItem);
}

function _getItems<T>(token: string, endpoint: string): Promise<T[]> {
    return getApiClient(token)
        .get(endpoint)
        .then(_extractItems);
}

function _transformFile(file: DataFile): DataFile {
    return { ...file, data_format: file.data_format.toLowerCase() };
}

function getFiles(token: string): Promise<DataFile[]> {
    return _getItems<DataFile>(token, "downloadable_files").then(trials =>
        trials.map(_transformFile)
    );
}

function getSingleFile(
    token: string,
    itemID: string
): Promise<DataFile | undefined> {
    return _getItem<DataFile>(token, "downloadable_files", itemID).then(
        _transformFile
    );
}

function getAccountInfo(token: string): Promise<Account | undefined> {
    return getApiClient(token)
        .get("users/self")
        .then(_extractItem);
}

function getTrials(token: string): Promise<Trial[]> {
    return _getItems(token, "trial_metadata");
}

function createUser(token: string, newUser: any): Promise<Account | undefined> {
    return getApiClient(token).post("new_users", newUser);
}

function getAllAccounts(token: string): Promise<Account[]> {
    return _getItems(token, "users");
}

function updateRole(
    token: string,
    itemID: string,
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
        .catch(error => [error.toString()]);
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
            params: { where: { to_user: userID } }
        })
        .then(_extractItems);
}

function grantPermission(
    token: string,
    user: Account,
    trial: string,
    assay: string
): Promise<any> {
    return getApiClient(token).post("permissions", {
        to_user: user.id,
        trial,
        assay_type: assay
    });
}

function revokePermission(token: string, permissionID: number): Promise<any> {
    return _getEtag<Permission>(token, "permissions", permissionID).then(etag =>
        getApiClient(token).delete(`permissions/${permissionID}`, {
            headers: { "if-match": etag }
        })
    );
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

function getExtraDataTypes(): Promise<string[]> {
    return getApiClient()
        .get("/info/extra_data_types")
        .then(_extractItem);
}

// ----------- Old API methods (not currently supported) ----------- //

async function deleteUser(
    token: string,
    itemID: string,
    etag: string
): Promise<Account | undefined> {
    console.error("not currently supported");
    return;
}

export {
    _getItem,
    _getItems,
    _extractErrorMessage,
    getApiClient,
    getFiles,
    getSingleFile,
    getAccountInfo,
    getTrials,
    createUser,
    getAllAccounts,
    updateRole,
    deleteUser,
    getUserEtag,
    uploadManifest,
    getManifestValidationErrors,
    getPermissionsForUser,
    grantPermission,
    revokePermission,
    getSupportedAssays,
    getSupportedManifests,
    getExtraDataTypes
};
