import React from "react";
import Frame, { FrameContextConsumer } from "react-frame-component";
import useRawFile from "../../util/useRawFile";

// TODO: refine this type
export interface INetworkData {
    [k: string]: any;
}

export interface IClustergrammerProps {
    networkData: INetworkData;
    width?: number;
    height?: number;
}

interface IClustergrammerConfig {
    network_data: INetworkData;
    sidebar_width: number;
}

/** Wrapper for clustergrammer-js: https://clustergrammer.readthedocs.io/clustergrammer_js.html
 *
 * NOTE: this component renders static files stored in the `public/static/cg/` directory.
 */
const Clustergrammer: React.FC<IClustergrammerProps> = props => {
    const cgHTML = useRawFile("static/cg/clustergrammer.html");

    const drawCg = (iframeContext: {
        Clustergrammer?: (config: IClustergrammerConfig) => void;
    }) => {
        if (iframeContext.Clustergrammer) {
            iframeContext.Clustergrammer({
                network_data: props.networkData,
                sidebar_width: 150
            });
        }
    };

    return cgHTML ? (
        <Frame
            initialContent={cgHTML}
            width={props.width || 1000}
            height={props.height || 600}
            frameBorder={0}
        >
            <FrameContextConsumer>
                {(context: any) => drawCg(context.document)}
            </FrameContextConsumer>
        </Frame>
    ) : null;
};

export default Clustergrammer;
