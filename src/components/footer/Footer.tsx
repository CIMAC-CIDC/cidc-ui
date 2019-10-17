import * as React from "react";
import "./Footer.css";
import { Link as MuiLink } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

export default class Footer extends React.Component<{}, {}> {
    public render() {
        return (
            <div className="Footer-container">
                <div className="Footer">
                    <div style={{ flex: 3 }}>
                        &copy; {new Date().getFullYear()} CIDC @ Dana-Farber
                        Cancer Institute{" "}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            flex: 2
                        }}
                    >
                        <div>
                            <MuiLink
                                underline="none"
                                href="https://cimac-network.org/cidc/"
                            >
                                About
                            </MuiLink>
                        </div>
                        <div>
                            <RouterLink
                                style={{ textDecoration: "none" }}
                                to="/privacy-security"
                            >
                                <MuiLink underline="none">
                                    Privacy and Security
                                </MuiLink>
                            </RouterLink>
                        </div>
                        <div>
                            <MuiLink
                                underline="none"
                                href="https://github.com/cimac-cidc"
                            >
                                GitHub
                            </MuiLink>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
