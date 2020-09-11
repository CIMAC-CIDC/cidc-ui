import axios, { AxiosPromise } from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    _getItem,
    _getItems,
    _extractErrorMessage,
    getApiClient,
    getAccountInfo,
    getManifestValidationErrors,
    updateRole,
    getFiles,
    getSingleFile,
    getFilelist,
    getDownloadURL,
    getTrials,
    getFilterFacets,
    getSupportedAssays,
    getSupportedManifests,
    getSupportedAnalyses,
    getExtraDataTypes
} from "./api";
import { XLSX_MIMETYPE } from "../util/constants";
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from "constants";

const axiosMock = new MockAdapter(axios);

const EMAIL = "foo@bar.com";
// TEST_TOKEN is a JWT with email foo@bar.com (there's nothing sensitive in it; it's just base-64 encoded)
const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXIuY29tIiwiaWF0IjoxfQ.eyj";
const OBJECT = { foo: "bar" };
const ENDPOINT = "some/route";

beforeEach(() => axiosMock.reset());

function respondsWith404(p: Promise<any>) {
    return p.catch(({ response }) => {
        expect(response.status).toBe(404);
    });
}

describe("_getItem", () => {
    it("handles an existing item", done => {
        const itemID = "1";
        const payload = OBJECT;
        const expectedRoute = ENDPOINT + "/" + itemID;

        axiosMock.onGet(expectedRoute).reply(200, payload);
        _getItem(TOKEN, ENDPOINT, itemID)
            .then(item => expect(item).toEqual(payload))
            .then(done);
    });

    it("bubbles up a 404 on a non-existent item", done => {
        respondsWith404(_getItem(TOKEN, ENDPOINT, "2")).then(done);
    });
});

describe("_getItems", () => {
    it("handles existing items", done => {
        const payload = { _items: [OBJECT, OBJECT] };

        axiosMock.onGet(ENDPOINT).reply(200, payload);

        _getItems(TOKEN, ENDPOINT)
            .then(items => expect(items).toEqual(payload._items))
            .then(done);
    });

    it("bubbles up a 404 on non-existent items", done => {
        respondsWith404(_getItems(TOKEN, ENDPOINT)).then(done);
    });
});

describe("_extractErrorMessage", () => {
    const endpoint = "foo";
    const client = getApiClient(TOKEN);

    it("handles non-Eve-style error messages", done => {
        const message = "an error message";
        axiosMock.onGet(endpoint).reply(() => [401, message]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err).toBe(message))
            .then(done);
    });

    it("handles Eve-style error messages", done => {
        const eveError = {
            _status: "ERR",
            _error: { message: "blah" }
        };
        axiosMock.onGet(endpoint).reply(() => [401, eveError]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err).toBe(eveError._error.message))
            .then(done);
    });

    it("handles empty error messages", done => {
        axiosMock.onGet(endpoint).reply(() => [401, undefined]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err.includes("401")).toBeTruthy())
            .then(done);
    });
});

test("updateRole", done => {
    const itemID = "1";
    const etag = "asdf";
    const role = "cidc-admin";

    axiosMock.onPatch(`users/${itemID}`).reply(config => {
        const json = JSON.parse(config.data);
        expect(json.role).toBe(role);
        expect(config.headers["if-match"]).toBe(etag);
        return [200];
    });

    updateRole(TOKEN, itemID, etag, role).then(done);
});

test("getManifestValidationErrors", done => {
    const xlsxBlob = new File(["foobar"], "test.xlsx", {
        type: XLSX_MIMETYPE
    });
    const formData = { schema: "foo", template: xlsxBlob };
    const response = { errors: ["a", "b", "c"] };

    axiosMock.onPost("ingestion/validate").reply(config => {
        expect(config.data.get("schema")).toBe(formData.schema);
        expect(config.data.get("template")).toEqual(formData.template);
        return [200, response];
    });

    getManifestValidationErrors(TOKEN, formData)
        .then(errors => expect(errors).toEqual(response.errors))
        .then(done);
});

test("getFiles", async () => {
    const response = {
        _items: [
            { id: 1, trial_id: "10021" },
            { id: 2, trial_id: "E4412" }
        ],
        _meta: { total: 10 }
    };
    axiosMock.onGet("downloadable_files").reply(200, response);

    const files = await getFiles(TOKEN);
    expect(files.data).toEqual(response._items);
    expect(files.meta).toEqual(response._meta);
});

test("getFileList", async () => {
    const filelist = "a\tb\nc\td\n";
    const fileIds = [1, 2, 3, 4, 5, 6];
    axiosMock.onGet("downloadable_files/filelist").reply(config => {
        expect(config.params?.file_ids).toBe("1,2,3,4,5,6");
        return [200, "a\tb\nc\td\n"];
    });

    expect(await getFilelist(TOKEN, fileIds)).toBeInstanceOf(Blob);
});

test("getDownloadURL", async () => {
    const url = "fake/url";
    const fileId = 1;
    axiosMock.onGet("downloadable_files/download_url").reply(config => {
        expect(config.params?.id).toBe(fileId);
        return [200, url];
    });

    expect(await getDownloadURL(TOKEN, fileId)).toBe(url);
});

test("getTrials", async () => {
    const response = {
        _items: [
            { id: 1, trial_id: "10021" },
            { id: 2, trial_id: "E4412" }
        ],
        _meta: { total: 10 }
    };
    axiosMock.onGet("trial_metadata").reply(config => {
        expect(config.params.sort_field).toBe("trial_id");
        expect(config.params.sort_direction).toBe("asc");
        return [200, response];
    });

    expect(await getTrials(TOKEN)).toEqual(response._items);
});

test("simple GET endpoints", async () => {
    const testConfigs = [
        { route: "users/self", endpoint: getAccountInfo },
        { route: "downloadable_files", endpoint: getSingleFile, withId: true },
        {
            route: "downloadable_files/filter_facets",
            endpoint: getFilterFacets
        },
        { route: "/info/assays", endpoint: getSupportedAssays },
        { route: "/info/manifests", endpoint: getSupportedManifests },
        { route: "/info/analyses", endpoint: getSupportedAnalyses },
        { route: "/info/extra_data_types", endpoint: getExtraDataTypes }
    ];

    await Promise.all(
        testConfigs.map(async ({ route, endpoint, withId }: any) => {
            const data = { some: "data" };
            const id = 1;
            axiosMock.onGet(withId ? `${route}/${id}` : route).reply(200, data);
            const result = await endpoint(TOKEN, id);
            expect(data).toEqual(data);
        })
    );
});
