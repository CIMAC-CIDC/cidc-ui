import * as React from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";
import App from "./App";
jest.mock("axios");
jest.mock("auth0-js");

it("renders without crashing", () => {
    axios.create.mockReturnValue({
        get: () => Promise.resolve({})
    });

    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});
