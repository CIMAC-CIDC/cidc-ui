import "@testing-library/jest-dom/extend-expect"; // add react-testing-library matchers to jest
import { cache } from "swr";

// clear the 'swr' cache between every test
beforeEach(() => cache.clear());

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
