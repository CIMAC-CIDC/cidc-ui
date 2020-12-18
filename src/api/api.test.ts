import axios, { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import { apiFetch, apiCreate, apiUpdate, apiDelete } from "./api";

const axiosMock = new MockAdapter(axios);
beforeEach(() => axiosMock.resetHandlers());

const url = "/test-endpoint";
const token = "test-token";
const etagErrorCode = 412;

const makeReply = (code: number, result: any, data?: any, etag?: string) => (
    config: AxiosRequestConfig
) => {
    expect(config.headers.authorization).toBe(`Bearer ${token}`);
    expect(config.headers["if-match"]).toBe(etag);
    if (data instanceof FormData) {
        expect([...config.data.entries()]).toEqual([...data.entries()]);
    } else {
        expect(config.data).toBe(JSON.stringify(data));
    }
    return [code, result, config.headers];
};

describe("apiFetch", () => {
    it("handles a successful GET request", async () => {
        const result = { foo: "bar" };
        axiosMock.onGet(url).reply(makeReply(200, result));

        await expect(apiFetch(url, token)).resolves.toEqual(result);
    });

    it("bubbles up errors from a failed GET request", async () => {
        const error = "uh oh!";
        axiosMock.onGet(url).reply(makeReply(etagErrorCode, error));

        await apiFetch(url, token).catch(({ response }) => {
            expect(response.status).toBe(etagErrorCode);
            expect(response.data).toBe(error);
        });
    });
});

describe("apiCreate", () => {
    const data = { foo: "bar" };
    it("handles a successful POST request with JSON data", async () => {
        axiosMock.onPost(url, data).reply(makeReply(200, data, data));

        await expect(apiCreate(url, token, { data })).resolves.toEqual(data);
    });

    it("handles a successful POST request with form data", async () => {
        const formData = new FormData();
        formData.append("foo", "bar");
        axiosMock
            .onPost(url, formData)
            .reply(makeReply(200, formData, formData));

        await expect(
            apiCreate(url, token, { data: formData })
        ).resolves.toEqual(formData);
    });

    it("bubbles up errors from a failed POST request", async () => {
        const error = "uh oh!";
        axiosMock
            .onPost(url, data)
            .reply(makeReply(etagErrorCode, error, data));

        await apiCreate(url, token, { data }).catch(({ response }) => {
            expect(response.status).toBe(etagErrorCode);
            expect(response.data).toBe(error);
        });
    });
});

// describe("apiUpdate", () => {});

// describe("apiDelete", () => {});
