import * as React from "react";
import { Grid } from "@material-ui/core";
import TemplateDownload from "./TemplateDownload";
import TemplateUpload from "./TemplateUpload";
import "./Templates.css";
import { AuthContext } from "../../auth/Auth";
import { RouteComponentProps } from "react-router";

export interface ITemplateCardProps {
    cardClass: string;
}

export default (props: RouteComponentProps) => {
    const auth = React.useContext(AuthContext)!;
    if (!auth.checkAuth(props.location.pathname)) {
        return null;
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <TemplateDownload cardClass={"Templates-card"} />
            </Grid>
            <Grid item xs={12}>
                <TemplateUpload cardClass={"Templates-card"} />
            </Grid>
        </Grid>
    );
};
