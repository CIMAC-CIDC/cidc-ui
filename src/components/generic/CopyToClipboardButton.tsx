import * as React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";

export interface ICopyToClipboardButtonProps extends ButtonProps {
    title: string;
    copyValue: string;
}

const CopyToClipboardButton: React.FunctionComponent<
    ICopyToClipboardButtonProps
> = ({ title, copyValue, ...buttonProps }) => {
    const [copied, setCopied] = React.useState<boolean>(false);

    return (
        <CopyToClipboard text={copyValue}>
            <Button {...buttonProps} onClick={() => setCopied(true)}>
                {copied ? `${title} Copied!` : `Copy ${title}`}
            </Button>
        </CopyToClipboard>
    );
};

export default CopyToClipboardButton;
