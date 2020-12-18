import axios, { AxiosRequestConfig, Method } from "axios";
import retry from "async-retry";

const baseURL: string = process.env.REACT_APP_API_URL!;

export function buildRequester(method: Method) {
    return async function requester<T>(
        url: string,
        idToken: string,
        config?: { etag?: string; data?: AxiosRequestConfig["data"] }
    ) {
        const data = config?.data;
        let etag = config?.etag;
        return retry<T>(
            async bail => {
                const headers = {
                    authorization: `Bearer ${idToken}`,
                    "if-match": etag,
                    "content-type":
                        data instanceof FormData ? "multipart/form" : undefined
                };
                const fullConfig = { url, method, baseURL, data, headers };
                try {
                    const res = await axios.request<T>(fullConfig);
                    return res.data;
                } catch (e) {
                    if (e.response.status === 412) {
                        const res = await axios.request({
                            ...fullConfig,
                            method: "get"
                        });
                        etag = res.data?._etag;
                        throw e;
                    }
                    bail(e);
                    // this ensures the function has return type `never`, not `void`
                    throw new Error("this code should never run!");
                }
            },
            { retries: 5 }
        );
    };
}

export const apiFetch = buildRequester("get");
export const apiCreate = buildRequester("post");
export const apiUpdate = buildRequester("patch");
export const apiDelete = buildRequester("delete");

export interface IApiPage<T> {
    _items: T[];
    _meta: {
        total: number;
    };
}
export interface IDataOverview {
    num_trials: number;
    num_assays: number;
    num_participants: number;
    num_samples: number;
    num_files: number;
    num_bytes: number;
}
