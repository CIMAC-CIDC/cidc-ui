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

it("renders a markdown document", async () => {
    axios.get.mockResolvedValue({ data });

    const { findByText } = render(<CIDCGithubMarkdown path="foo" />);

    expect(await findByText(/Some Fun Docs/i)).toBeInTheDocument();
});

it("renders a markdown document with trimmed header", async () => {
    axios.get.mockResolvedValue({ data });

    const { queryByText, findByText: fbt1 } = render(
        <CIDCGithubMarkdown trimLeadingHeader path="foo" />
    );

    expect(await fbt1(/do something cool/i)).toBeInTheDocument();
    expect(queryByText(/Some Fun Docs/i)).not.toBeInTheDocument();

    // nothing funky should happen if there's no leading header in the first place
    axios.get.mockResolvedValue({
        // remove the first line from the example md
        data: data
            .split("\n")
            .slice(1)
            .join("\n")
    });
    const { findByText: fbt2 } = render(
        <CIDCGithubMarkdown trimLeadingHeader path="foo" />
    );
    expect(await fbt2(/do something cool/i)).toBeInTheDocument();
});

it("replaces [token] with a user's actual id token", async () => {
    axios.get.mockResolvedValue({ data });

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
