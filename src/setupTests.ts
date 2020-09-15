import "@testing-library/jest-dom/extend-expect"; // add react-testing-library matchers to jest

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
(global as any).localStorage = localStorageMock;

window.URL.createObjectURL = jest.fn();
HTMLCanvasElement.prototype.getContext = jest.fn();
