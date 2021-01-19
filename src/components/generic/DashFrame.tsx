import React from "react";
import { formatQueryString } from "../../util/formatters";
import { withIdToken } from "../identity/AuthProvider";
import withResize from "./withResize";

export interface IDashFrameProps {
    dashboardId: string;
    urlParams?: Record<string, string>;
}

const makeDashboardURL = (
    dashboardId: string,
    params: Record<string, string>
) => {
    return `${
        process.env.REACT_APP_API_URL
    }/dashboards/${dashboardId}?${formatQueryString(params)}`;
};

const DashFrame = withIdToken<IDashFrameProps>(
    withResize<
        IDashFrameProps & { token: string; width?: number; height?: number }
    >(props => {
        return props.height && props.width ? (
            <iframe
                title={props.dashboardId}
                src={makeDashboardURL(props.dashboardId, {
                    id_token: props.token,
                    ...props.urlParams
                })}
                height={props.height}
                width={props.width}
                frameBorder={0}
            />
        ) : null;
    })
);

export default DashFrame;
