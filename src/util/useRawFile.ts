import React from "react";
import axios from "axios";

/** Load and return a static file as a raw string */
const useRawFile = (url: string): string | undefined => {
    const [content, setContent] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        axios.get(url).then(response => setContent(response.data));
    }, [url]);

    return content;
};

export default useRawFile;
