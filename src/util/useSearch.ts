import React from "react";
import FlexSearch, { Index, CreateOptions } from "flexsearch";

const defaultSettings: CreateOptions = {
    tokenize: "full"
};

const useSearch = (query: string, data: string[]): string[] => {
    const indexRef = React.useRef<Index<string>>(null);
    if (indexRef.current === null) {
        // @ts-ignore
        indexRef.current = FlexSearch.create(defaultSettings);
        data.forEach((datum, i) => indexRef.current!.add(i, datum));
    }

    // @ts-ignore
    const resultIds: string[] = indexRef.current!.search(query);
    const results = resultIds.map(id => data[id]);

    return results;
};

export default useSearch;
