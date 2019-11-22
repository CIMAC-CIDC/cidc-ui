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

const Clustergrammer: React.FC<IClustergrammerProps> = props => {
    const cgHTML = useRawFile("static/cg/clustergrammer.html");

    const drawCg = (iframeContext: {
        clustergrammer?: (data: INetworkData) => void;
    }) => {
        if (iframeContext.clustergrammer) {
            iframeContext.clustergrammer(props.networkData);
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
