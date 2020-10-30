import * as React from "react";
import ReactMarkdown, { ReactMarkdownProps } from "react-markdown";
import "github-markdown-css/github-markdown.css";
import { AuthContext } from "../identity/AuthProvider";
import axios from "axios";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    markdown: {
        fontFamily: theme.typography.fontFamily
    }
}));

export const CIDCMarkdown: React.FC<Omit<
    ReactMarkdownProps,
    "className"
>> = props => {
    const classes = useStyles();

    return (
        <ReactMarkdown
            className={`markdown-body ${classes.markdown}`}
            {...props}
        />
    );
};

export interface ICIDCGithubMarkdownProps {
    path: string;
    trimLeadingHeader?: boolean;
    insertIdToken?: boolean;
}

const MARKDOWN_BASE_URL = "https://raw.githubusercontent.com/CIMAC-CIDC/";

const CIDCGithubMarkdown: React.FunctionComponent<ICIDCGithubMarkdownProps> = props => {
    const authData = React.useContext(AuthContext);

    const [markdown, setMarkdown] = React.useState<string | undefined>(
        undefined
    );

    const fullURL = MARKDOWN_BASE_URL + props.path;

    const idToken = props.insertIdToken && authData && authData.idToken;

    React.useEffect(() => {
        setMarkdown(undefined);
        axios.get(fullURL).then(({ data: text }) => {
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

    return markdown ? <CIDCMarkdown source={markdown} /> : null;
};

export default CIDCGithubMarkdown;
