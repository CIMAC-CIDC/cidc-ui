import React from "react";
import FlexSearch, { Index, CreateOptions } from "flexsearch";

const defaultSettings: CreateOptions = {
    tokenize: "full"
};

/**
 * A hook for searching simple client-side data.
 */
const useSearch = (
    data: string[],
    settings: CreateOptions = defaultSettings
): ((query: string) => string[]) => {
    const index = React.useState<Index<string>>(() => {
        const newIndex = FlexSearch.create<string>(settings);
        data.forEach((datum, i) => newIndex.add(i, datum));
        return newIndex;
    })[0];

    return (query: string) => {
        // @ts-ignore
        const resultIds: string[] = index.search(query);
        const results = resultIds.map(id => data[id]);
        return results;
    };
};

export default useSearch;
