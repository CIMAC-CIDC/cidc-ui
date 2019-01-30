import { createAPIHelper } from "./utilities";
import { File } from "../model/File";
import { AccountInfo } from "../model/AccountInfo";
import { Trial } from "../model/Trial";

const apiHelper = createAPIHelper();

async function getData(token: string): Promise<File[] | undefined> {
    const options = {
        endpoint: "data",
        json: true,
        method: "GET",
        token
    };
    
    const result = await apiHelper.get<{ _items: File[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function getAccountInfo(token: string): Promise<AccountInfo[] | undefined> {
    const options = {
        endpoint: "accounts_info",
        json: true,
        method: "GET",
        token
    };

    const result = await apiHelper.get<{ _items: AccountInfo[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

async function getTrials(token: string): Promise<Trial[] | undefined> {
    const options = {
        endpoint: "trials",
        json: true,
        method: "GET",
        token
    };
    
    const result = await apiHelper.get<{ _items: Trial[] }>(options);

    if (!result) {
        return;
    }

    return result._items;
}

export { getData, getAccountInfo, getTrials };