import { createAPIHelper } from "./utilities";
import { File } from "../model/file";
import { Account } from "../model/account";
import { Trial } from "../model/trial";
import { Analysis } from "../model/analysis";
import { decode } from "jsonwebtoken";

// While we transition from the old API to the new API,
// both will be in partial use here.
const newURL: string = process.env.REACT_APP_API_URL!;
const oldURL: string = process.env.REACT_APP_OLD_API_URL!;

const oldAPI = createAPIHelper(oldURL);
const newAPI = createAPIHelper(newURL);

async function getFiles(token: string): Promise<File[] | undefined> {
    const options = {
        endpoint: "downloadable_files",
        json: true,
        token
    };

    const result = await newAPI.get<{ _items: File[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function getSingleFile(
    token: string,
    itemID: string
): Promise<File | undefined> {
    const options = {
        endpoint: "downloadable_files",
        json: true,
        itemID,
        token
    };

    const result = await newAPI.get<File>(options);

    if (!result) {
        return;
    }

    return result;
}

async function getAccountInfo(token: string): Promise<Account[] | undefined> {
    const decodedToken = decode(token) as any;
    const email = decodedToken!.email;

    const options = {
        endpoint: "users",
        json: true,
        parameters: { where: JSON.stringify({ email }) },
        token
    };

    const result = await newAPI.get<{ _items: Account[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function getTrials(token: string): Promise<Trial[] | undefined> {
    const options = {
        endpoint: "trial_metadata",
        json: true,
        token
    };

    const result = await newAPI.get<{ _items: Trial[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function createUser(
    token: string,
    newUser: any
): Promise<Account | undefined> {
    const options = {
        endpoint: "new_users",
        json: true,
        token,
        body: newUser
    };

    const result = await newAPI.post<Account>(options);

    if (!result) {
        return;
    }

    return result;
}

async function getAllAccounts(token: string): Promise<Account[] | undefined> {
    const options = {
        endpoint: "users",
        json: true,
        token
    };

    const result = await newAPI.get<{ _items: Account[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function updateRole(
    token: string,
    itemID: string,
    etag: string,
    role: string
): Promise<Account | undefined> {
    const options = {
        endpoint: "users",
        json: true,
        token,
        body: { role },
        itemID,
        etag
    };

    const result = await newAPI.patch<Account>(options);

    if (!result) {
        return;
    }

    return result;
}

async function deleteUser(
    token: string,
    itemID: string,
    etag: string
): Promise<Account | undefined> {
    console.error("user deletion not currently supported");
    return;

    // const options = {
    //     endpoint: "accounts",
    //     json: true,
    //     token,
    //     itemID,
    //     etag
    // };

    // const result = await oldAPI.delete<Account>(options);

    // if (!result) {
    //     return;
    // }

    // return result;
}

async function updateTrial(
    token: string,
    itemID: string,
    etag: string,
    collaborators: any
): Promise<Trial | undefined> {
    const options = {
        endpoint: "trials",
        json: true,
        token,
        body: { collaborators },
        itemID,
        etag
    };

    const result = await oldAPI.patch<Trial>(options);

    if (!result) {
        return;
    }

    return result;
}

async function getAnalyses(token: string): Promise<Analysis[] | undefined> {
    const options = {
        endpoint: "analysis",
        json: true,
        token
    };

    const result = await oldAPI.get<{ _items: Analysis[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function getUserEtag(
    token: string,
    itemID: string
): Promise<string | undefined> {
    const options = {
        endpoint: "users",
        json: true,
        itemID,
        token
    };

    const result = await newAPI.get<{ _etag: string }>(options);

    if (!result) {
        return;
    }

    return result._etag;
}

async function getSingleAnalysis(
    token: string,
    itemID: string
): Promise<Analysis | undefined> {
    const options = {
        endpoint: "analysis",
        json: true,
        itemID,
        token
    };

    const result = await oldAPI.get<Analysis>(options);

    if (!result) {
        return;
    }

    return result;
}

export {
    getFiles,
    getSingleFile,
    getAccountInfo,
    getTrials,
    createUser,
    getAllAccounts,
    updateRole,
    deleteUser,
    updateTrial,
    getAnalyses,
    getUserEtag,
    getSingleAnalysis
};
