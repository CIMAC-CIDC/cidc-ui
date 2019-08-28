import { Account } from "../model/account";
import { Trial } from "../model/trial";
import { decode } from "jsonwebtoken";
import { DataFile } from "../model/file";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const URL: string = process.env.REACT_APP_API_URL!;

function getApiClient(token: string): AxiosInstance {
    return axios.create({
        headers: { Authorization: `Bearer ${token}` },
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

function _getItem<T>(
    token: string,
    endpoint: string,
    itemID: string
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

function getFiles(token: string): Promise<DataFile[]> {
    return _getItems(token, "downloadable_files");
}

function getSingleFile(
    token: string,
    itemID: string
): Promise<DataFile | undefined> {
    return _getItem(token, "downloadable_files", itemID);
}

function getAccountInfo(token: string): Promise<Account | undefined> {
    const decodedToken = decode(token) as any;
    const email = decodedToken!.email;

    return getApiClient(token)
        .get("users", { params: { where: { email } } })
        .then(res => {
            const users = _extractItems(res);
            return users ? users[0] : undefined;
        });
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

function getManifestValidationErrors(
    token: string,
    form: { schema: string; template: File }
): Promise<string[] | undefined> {
    const formData = new FormData();
    formData.append("schema", form.schema.toLowerCase());
    formData.append("template", form.template);

    return getApiClient(token)
        .post("ingestion/validate", formData, {
            headers: { "content-type": "multipart/form" }
        })
        .then(res => _extractItem(res).errors);
}

function getUserEtag(token: string, itemID: string): Promise<string> {
    return _getItem<Account>(token, "users", itemID).then(user => user._etag);
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
    getFiles,
    getSingleFile,
    getAccountInfo,
    getTrials,
    createUser,
    getAllAccounts,
    updateRole,
    deleteUser,
    getUserEtag,
    getManifestValidationErrors
};
