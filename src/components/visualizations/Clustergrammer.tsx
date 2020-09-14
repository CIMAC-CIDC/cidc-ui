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

/** Wrapper for clustergrammer-js: https://clustergrammer.readthedocs.io/clustergrammer_js.html
 *
 * NOTE: this component renders static files stored in the `public/static/cg/` directory.
 */
const Clustergrammer: React.FC<IClustergrammerProps> = props => {
    const cgHTML = useRawFile("/static/cg/clustergrammer.html");

    const drawCg = (iframe: {
        document: Document & { DrawClustergram?: (cfg: any) => void };
    }) => {
        setTimeout(() => {
            if (iframe.document.DrawClustergram) {
                iframe.document.DrawClustergram({
                    network_data: props.networkData,
                    sidebar_width: 150
                });
            }
        }, 1000);
    };

    return cgHTML ? (
        <Frame
            title="clustergrammer-iframe"
            initialContent={cgHTML}
            width={props.width || 1000}
            height={props.height || 600}
            frameBorder={0}
        >
            <FrameContextConsumer>
                {(context: any) => drawCg(context)}
            </FrameContextConsumer>
        </Frame>
    ) : null;
};

export default Clustergrammer;
