import React from "react";
import Frame, { FrameContextConsumer } from "react-frame-component";
import useRawFile from "../../util/useRawFile";
import testData from "./testData";

const Clustergrammer: React.FC = () => {
    const cgHTML = useRawFile("static/cg/clustergrammer.html");

    return cgHTML ? (
        <Frame
            initialContent={cgHTML}
            width={1000}
            height={500}
            frameBorder={0}
        >
            <FrameContextConsumer>
                {({
                    document
                }: {
                    document: { make_clust?: (data: any) => void };
                }) => {
                    if (document.make_clust) {
                        document.make_clust(testData);
                    }
                }}
            </FrameContextConsumer>
        </Frame>
    ) : null;
};

export default Clustergrammer;
