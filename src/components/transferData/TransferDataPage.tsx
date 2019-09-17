import * as React from "react";
import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

export default class TransferDataPage extends React.Component<any, {}> {
    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div>
                <Typography
                    variant="h6"
                    gutterBottom={true}
                    style={{ fontWeight: "bold" }}
                >
                    In order to transfer data:
                </Typography>
                <Typography style={{ fontSize: 18 }} paragraph={true}>
                    Start by reading our{" "}
                    <Link to="/transfer-data/cli-instructions">
                        instructions on using the CIDC Transfer Tool.
                    </Link>
                </Typography>
                <Typography paragraph={true} style={{ fontSize: 18 }}>
                    Then, browse our documentation regrading specific assay
                    types:
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                    <li>
                        How to upload{" "}
                        <Link to="/transfer-data/wes">
                            whole exome sequencing data.
                        </Link>
                    </li>
                    <li>
                        How to upload{" "}
                        <Link to="/transfer-data/olink">Olink data.</Link>
                    </li>
                </Typography>
            </div>
        );
    }
}
