import React from "react";
import { render } from "@testing-library/react";
import axios from "axios";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import { AuthContext } from "../identity/AuthProvider";
jest.mock("axios");

const data = `# Some Fun Docs

This guide will help you do something cool.

\`\`\`
$ cidc login [token]
\`\`\`
`;

beforeEach(() => {
    axios.get.mockResolvedValue({ data });
});

it("renders a markdown document", async () => {
    const { findByText } = render(<CIDCGithubMarkdown path="foo" />);

    expect(await findByText(/Some Fun Docs/i)).toBeInTheDocument();
});

describe("trimLeadingHeader", () => {
    it("renders a markdown document with trimmed header", async () => {
        const { queryByText, findByText } = render(
            <CIDCGithubMarkdown trimLeadingHeader path="foo" />
        );

        expect(await findByText(/do something cool/i)).toBeInTheDocument();
        expect(queryByText(/Some Fun Docs/i)).not.toBeInTheDocument();
    });

    it("doesn't do anything weird if there's no header", async () => {
        axios.get.mockResolvedValue({
            // remove the first line from the example md
            data: data
                .split("\n")
                .slice(1)
                .join("\n")
        });
        const { findByText } = render(
            <CIDCGithubMarkdown trimLeadingHeader path="foo" />
        );
        expect(await findByText(/do something cool/i)).toBeInTheDocument();
    });
});

it("replaces [token] with a user's actual id token", async () => {
    const idToken = "fake-test-token";

    const { findByText } = render(
        <AuthContext.Provider
            value={{
                state: "logged-in",
                userInfo: { idToken, user: { email: "" } }
            }}
        >
            <CIDCGithubMarkdown insertIdToken path="foo" />
        </AuthContext.Provider>
    );

    expect(await findByText(new RegExp(idToken, "i"))).toBeInTheDocument();
});
