import React from "react";
import { Box } from "@material-ui/core";

interface IWidthHeight {
    width?: number;
    height?: number;
}

export default function withResize<
    P extends IWidthHeight,
    R = Omit<P, keyof IWidthHeight>
>(Component: React.ComponentType<P>): React.ComponentType<R> {
    const ResizableComponent: React.FC<R> = props => {
        const boxRef = React.useRef<HTMLDivElement>();
        const [height, setHeight] = React.useState<number | undefined>();
        const [width, setWidth] = React.useState<number | undefined>();

        const refreshBounds = React.useCallback(() => {
            if (boxRef.current) {
                const rect = boxRef.current.getBoundingClientRect();
                setHeight(rect.height);
                setWidth(rect.width);
            }
        }, [boxRef]);

        React.useEffect(() => {
            refreshBounds();
            window.addEventListener("resize", refreshBounds);
            return () => window.removeEventListener("resize", refreshBounds);
        }, [refreshBounds]);

        return (
            <Box
                // @ts-ignore
                ref={boxRef}
                width="100%"
                height="100%"
            >
                {/* @ts-ignore */}
                <Component height={height} width={width} {...props} />
            </Box>
        );
    };
    return ResizableComponent;
}
