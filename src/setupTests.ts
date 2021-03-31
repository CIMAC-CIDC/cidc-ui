import "@testing-library/jest-dom/extend-expect"; // add react-testing-library matchers to jest
import { cleanup } from "@testing-library/react-hooks";
import { cache } from "swr";

beforeEach(() => {
    // clear the 'swr' cache between every test
    cache.clear();

    // even though this should be getting called automatically
    // between every test, some tests need this (don't know the
    // root cause yet, but seems useSWR-related)
    cleanup();
});

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
(global as any).localStorage = localStorageMock;

window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();
HTMLCanvasElement.prototype.getContext = jest.fn();

jest.setTimeout(10000);
