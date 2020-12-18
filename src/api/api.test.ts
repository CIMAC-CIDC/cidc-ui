import axios, { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import { apiFetch, apiCreate, apiUpdate, apiDelete } from "./api";

const axiosMock = new MockAdapter(axios);
beforeEach(() => axiosMock.resetHandlers());

const url = "/test-endpoint";
const token = "test-token";
const etagErrorCode = 412;
const data = { foo: "bar" };

const makeReply = (
    code: number,
    result: any,
    expectedData?: any,
    exepectedEtag?: string
) => (config: AxiosRequestConfig) => {
    try {
        expect(config.headers.authorization).toBe(`Bearer ${token}`);
        expect(config.headers["if-match"]).toBe(exepectedEtag);
        if (expectedData instanceof FormData) {
            expect([...config.data.entries()]).toEqual([
                ...expectedData.entries()
            ]);
        } else {
            expect(config.data).toBe(JSON.stringify(expectedData));
        }
    } catch (e) {
        console.log(e);
        return [500, e];
    }
    return [code, result, config.headers];
};

describe("apiFetch", () => {
    it("handles a successful GET request", async () => {
        axiosMock.onGet(url).reply(makeReply(200, data));

        await expect(apiFetch(url, token)).resolves.toEqual(data);
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

describe("apiUpdate", () => {
    const etag = "test-etag";
    it("handles a successful PATCH with up-to-date etag", async () => {
        axiosMock.onPatch(url, data).reply(makeReply(200, data, data, etag));

        await expect(apiUpdate(url, token, { data, etag })).resolves.toEqual(
            data
        );
    });

    it("handles and successfully retries a PATCH with out-of-date etag", async () => {
        const newEtag = "new-test-etag";
        axiosMock
            .onPatch(url, data)
            .replyOnce(makeReply(etagErrorCode, "stale etag", data, etag))
            .onGet(url)
            .replyOnce(makeReply(200, { ...data, _etag: newEtag }))
            .onPatch(url, data)
            .replyOnce(makeReply(200, data, data, newEtag));

        await expect(apiUpdate(url, token, { data, etag })).resolves.toEqual(
            data
        );
    });

    it("eventually gives up if etag refreshing isn't working", async () => {
        axiosMock
            .onPatch(url, data)
            .reply(makeReply(etagErrorCode, "stale etag", data, etag))
            .onGet(url)
            .reply(makeReply(200, { ...data, _etag: etag }));
        await apiUpdate(url, token, { data, etag }).catch(({ response }) => {
            expect(response.status).toBe(412);
            expect(response.data).toBe("stale etag");
        });
    }, 15000); // takes a while because requests are tried with exponential backoff

    it("bubbles up errors from a failed PATCH requests (non-etag-related)", async () => {
        const error = "uh oh!";
        axiosMock.onPatch(url, data).reply(makeReply(400, error, data));

        await apiUpdate(url, token, { data }).catch(({ response }) => {
            expect(response.status).toBe(400);
            expect(response.data).toBe(error);
        });
    });
});

describe("apiDelete", () => {
    const etag = "test-etag";
    const success = "ok";
    it("handles a successful DELETE with up-to-date etag", async () => {
        axiosMock.onDelete(url).reply(makeReply(200, success, undefined, etag));

        await expect(apiDelete(url, token, { etag })).resolves.toBe(success);
    });

    it("handles and successfully retries a DELETE with out-of-date etag", async () => {
        const newEtag = "new-test-etag";
        axiosMock
            .onDelete(url)
            .replyOnce(makeReply(etagErrorCode, "stale etag", undefined, etag))
            .onGet(url)
            .replyOnce(makeReply(200, { ...data, _etag: newEtag }))
            .onDelete(url)
            .replyOnce(makeReply(200, success, undefined, newEtag));

        await expect(apiDelete(url, token, { etag })).resolves.toEqual(success);
    });

    it("eventually gives up if etag refreshing isn't working", async () => {
        axiosMock
            .onDelete(url, data)
            .reply(makeReply(etagErrorCode, "stale etag", undefined, etag))
            .onGet(url)
            .reply(makeReply(200, { ...data, _etag: etag }));
        await apiDelete(url, token, { etag }).catch(({ response }) => {
            expect(response.status).toBe(412);
            expect(response.data).toBe("stale etag");
        });
    }, 15000); // takes a while because requests are tried with exponential backoff

    it("bubbles up errors from a failed DELETE requests (non-etag-related)", async () => {
        const error = "uh oh!";
        axiosMock.onDelete(url).reply(makeReply(400, error, undefined));

        await apiDelete(url, token).catch(({ response }) => {
            expect(response.status).toBe(400);
            expect(response.data).toBe(error);
        });
    });
});
