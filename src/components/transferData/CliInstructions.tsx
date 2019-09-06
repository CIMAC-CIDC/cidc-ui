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

export interface ICliInstructionsState {
    tokenVisible: boolean;
}

export default class CliInstructions extends React.Component<
    any,
    ICliInstructionsState
> {
    state: ICliInstructionsState = {
        tokenVisible: false
    };

    private handleClick() {
        this.setState({ tokenVisible: !this.state.tokenVisible });
    }

    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div className="Markdown-width">
                <CIDCGithubMarkdown
                    path="cidc-cli/master/README.md"
                    trimStartLines={4}
                />
                <Paper className="User-account-paper" style={{ marginTop: 20 }}>
                    <Toolbar className="User-account-toolbar">
                        <Typography className="User-account-toolbar-text">
                            Token for logging into CLI
                        </Typography>
                    </Toolbar>
                    <div className="User-details">
                        <div>
                            <Typography style={{ fontSize: 18 }}>
                                After you've installed the CLI and are ready to
                                upload data, paste the token below into the
                                login command to authenticate yourself.
                            </Typography>
                            <div
                                style={{
                                    backgroundColor: "black",
                                    padding: 10,
                                    marginTop: 10,
                                    borderRadius: 5
                                }}
                            >
                                <Typography
                                    style={{
                                        color: "white",
                                        fontFamily: "Monaco"
                                    }}
                                >
                                    (Cmd) login ey927853.......
                                </Typography>
                            </div>
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
                                    the CIDC System, treat it as you would a
                                    password! Anyone who has your token can
                                    perform actions as if they were you.
                                </Typography>
                                <Typography
                                    style={{ color: "#db2828" }}
                                    paragraph={true}
                                >
                                    Do not share your token with anyone! We will
                                    never ask you to send a token over email.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() => this.handleClick()}
                                >
                                    Click to reveal the token that you will
                                    paste in the above command
                                </Button>
                                {this.state.tokenVisible && (
                                    <div style={{ marginTop: 10 }}>
                                        <Grid container={true} spacing={8}>
                                            <Grid item={true}>
                                                <CopyToClipboard
                                                    text={this.props.auth.getIdToken()}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                    >
                                                        Copy token to Clipboard
                                                    </Button>
                                                </CopyToClipboard>
                                            </Grid>
                                            <Grid item={true}>
                                                <div className="Token-input-border">
                                                    <TextField
                                                        defaultValue={this.props.auth.getIdToken()}
                                                        InputProps={{
                                                            disableUnderline: true
                                                        }}
                                                        style={{
                                                            backgroundColor:
                                                                "white",
                                                            height: 26,
                                                            padding: 5
                                                        }}
                                                    />
                                                </div>
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    }
}
