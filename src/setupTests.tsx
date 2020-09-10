import React from "react";
import { Router } from "react-router-dom";
import { render } from "@testing-library/react";
import history from "./components/identity/History";
import "@testing-library/jest-dom/extend-expect"; // add react-testing-library matchers to jest

// A lot of components access the react-router context - this helper
// function makes it easier to render those components in tests.
(global as any).renderWithRouter = (component: React.ReactElement) => {
    return render(<Router history={history}>{component}</Router>);
};

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
(global as any).localStorage = localStorageMock;

window.URL.createObjectURL = jest.fn();
HTMLCanvasElement.prototype.getContext = jest.fn();
