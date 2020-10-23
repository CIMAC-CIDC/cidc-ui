import React from "react";
import { withRouter, RouteComponentProps } from "react-router";
import Link, { LinkProps } from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    link: { cursor: "pointer" }
});

const MuiRouterLink: React.FC<RouteComponentProps & {
    LinkProps?: LinkProps;
    to: string;
}> = props => {
    const classes = useStyles();
    return (
        <Link
            {...(props.LinkProps || {})}
            className={classes.link}
            href={props.to}
            onClick={(e: any) => {
                e.preventDefault();
                props.history.push(props.to);
            }}
        >
            {props.children}
        </Link>
    );
};

export default withRouter(MuiRouterLink);
