import * as React from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";
import { MARKDOWN_BASE_URL } from "../../util/constants";

export interface IRemoteMarkdownProps {
    path: string;
    trimStartLines?: number;
}

const RemoteMarkdown: React.FunctionComponent<IRemoteMarkdownProps> = props => {
    const [markdown, setMarkdown] = React.useState<string | undefined>(
        undefined
    );

    const fullURL = MARKDOWN_BASE_URL + props.path;

    React.useEffect(() => {
        fetch(fullURL)
            .then(response => response.text())
            .then(text => {
                const cleanText = props.trimStartLines
                    ? text
                          .split("\n")
                          .slice(props.trimStartLines)
                          .join("\n")
                    : text;
                setMarkdown(cleanText);
            });
    }, [fullURL, props.trimStartLines]);

    return (
        <div>
            <ReactMarkdown
                source={markdown}
                className="markdown-body Markdown-width"
            />
        </div>
    );
};

export default RemoteMarkdown;
