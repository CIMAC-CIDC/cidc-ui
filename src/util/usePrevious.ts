import React from "react";

export default function usePrevious<T>(value: T): T {
    const ref = React.useRef<T>(value);

    React.useEffect(() => {
        ref.current = value;
    }, [ref, value]);

    return ref.current;
}
