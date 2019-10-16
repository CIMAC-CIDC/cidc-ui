import * as React from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";
import { AuthContext } from "../identity/AuthProvider";

export interface ICIDCGithubMarkdownProps {
    path: string;
    insertIdToken?: boolean;
}

const MARKDOWN_BASE_URL = "https://raw.githubusercontent.com/CIMAC-CIDC/";

const CIDCGithubMarkdown: React.FunctionComponent<
    ICIDCGithubMarkdownProps
> = props => {
    const authData = React.useContext(AuthContext);

    const [markdown, setMarkdown] = React.useState<string | undefined>(
        undefined
    );

    const fullURL = MARKDOWN_BASE_URL + props.path;

    const idToken = props.insertIdToken && authData && authData.idToken;

    React.useEffect(() => {
        fetch(fullURL)
            .then(response => response.text())
            .then(text => {
                const finalText = idToken
                    ? text.replace(
                          /cidc login \[token\]/g,
                          "cidc login " + idToken
                      )
                    : text;
                setMarkdown(finalText);
            });
    }, [fullURL, idToken]);

    return (
        <div>
            <ReactMarkdown
                source={markdown}
                className="markdown-body Markdown-width"
            />
        </div>
    );
};

export default CIDCGithubMarkdown;
