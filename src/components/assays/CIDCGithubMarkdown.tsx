import * as React from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";
import { AuthContext } from "../identity/AuthProvider";
import { useRootStyles } from "../../rootStyles";

export interface ICIDCGithubMarkdownProps {
    path: string;
    trimLeadingHeader?: boolean;
    insertIdToken?: boolean;
}

const MARKDOWN_BASE_URL = "https://raw.githubusercontent.com/CIMAC-CIDC/";

const CIDCGithubMarkdown: React.FunctionComponent<
    ICIDCGithubMarkdownProps
> = props => {
    const { markdown: markdownClass } = useRootStyles();

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
                // Header trimming
                let trimmedText = text;
                if (props.trimLeadingHeader) {
                    const lines = text.split("\n");
                    const hasLeadingHeader = lines && lines[0].startsWith("#");
                    if (hasLeadingHeader) {
                        trimmedText = lines.slice(1).join("\n");
                    }
                }

                // ID token substitution
                const finalText = idToken
                    ? trimmedText.replace(
                          /cidc login \[token\]/g,
                          "cidc login " + idToken
                      )
                    : trimmedText;

                setMarkdown(finalText);
            });
    }, [fullURL, idToken, props.trimLeadingHeader]);

    return (
        <div>
            <ReactMarkdown
                source={markdown}
                className={`markdown-body ${markdownClass}`}
            />
        </div>
    );
};

export default CIDCGithubMarkdown;
