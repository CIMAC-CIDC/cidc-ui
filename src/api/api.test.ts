import axios, { AxiosPromise } from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    _getItem,
    _getItems,
    _extractErrorMessage,
    getApiClient,
    getAccountInfo,
    getManifestValidationErrors,
    updateRole
} from "./api";
import { XLSX_MIMETYPE } from "../util/constants";

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

test("getAccountInfo", done => {
    const payload = { _items: [OBJECT] };

    axiosMock.onGet("users").reply(config => {
        expect(config.params.where).toBeDefined();
        expect(config.params.where).toEqual({ email: EMAIL });
        return [200, payload];
    });

    getAccountInfo(TOKEN)
        .then(user => expect(user).toEqual(OBJECT))
        .then(done);
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
