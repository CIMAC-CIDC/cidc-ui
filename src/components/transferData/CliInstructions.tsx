import * as React from "react";
import {
    Paper,
    Toolbar,
    Typography,
    Button,
    TextField,
    Grid
} from "@material-ui/core";
import "./TransferData.css";
import CopyToClipboard from "react-copy-to-clipboard";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";

export default class CliInstructions extends React.Component<any> {
    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        const token = this.props.auth.getIdToken();
        const truncToken = token && token.slice(0, 20);

        return (
            <div className="Markdown-width">
                <CIDCGithubMarkdown
                    path="cidc-cli/master/README.md"
                    trimStartLines={4}
                />
                <Paper className="User-account-paper" style={{ marginTop: 20 }}>
                    <Toolbar className="User-account-toolbar">
                        <Typography className="User-account-toolbar-text">
                            CLI Login Token
                        </Typography>
                    </Toolbar>
                    <div className="User-details">
                        <div>
                            <Typography style={{ fontSize: 18 }}>
                                After you've installed the CLI and are ready to
                                upload data, use this token to authenticate with
                                the API. For security purposes, this token is
                                temporary, and you will need to return to CIDC
                                Portal to refresh it periodically.
                            </Typography>
                            <div
                                style={{
                                    backgroundColor: "#ffe8e6",
                                    padding: 10,
                                    marginTop: 10,
                                    borderRadius: 5,
                                    borderColor: "#db2828",
                                    borderWidth: 1,
                                    borderStyle: "solid"
                                }}
                            >
                                <Typography
                                    style={{ color: "#db2828" }}
                                    paragraph={true}
                                >
                                    Your token represents your identity within
                                    the CIDC System, so do not share it! Anyone
                                    who has your token can perform actions as if
                                    they were you.
                                </Typography>
                                <div style={{ marginTop: 10 }}>
                                    <Grid container={true} spacing={8}>
                                        <Grid item={true}>
                                            <div className="Token-input-border">
                                                <TextField
                                                    value={truncToken}
                                                    InputProps={{
                                                        disableUnderline: true
                                                    }}
                                                    style={{
                                                        backgroundColor:
                                                            "white",
                                                        pointerEvents: "none"
                                                    }}
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item={true}>
                                            <CopyToClipboard text={token}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                >
                                                    Copy Token
                                                </Button>
                                            </CopyToClipboard>
                                        </Grid>
                                    </Grid>
                                </div>
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    }
}
