import React from "react";
import { FadeProps, Fade } from "@material-ui/core";

const FadeInOnMount: React.FC<Omit<FadeProps, "in">> = ({
    children,
    ...fadeProps
}) => {
    const [show, setShow] = React.useState<boolean>(false);
    React.useEffect(() => setShow(true), []);

    return (
        <Fade in={show} {...fadeProps}>
            {children}
        </Fade>
    );
};

export default FadeInOnMount;
