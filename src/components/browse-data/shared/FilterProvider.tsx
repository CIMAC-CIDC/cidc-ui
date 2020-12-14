import React from "react";
import { Dictionary, uniq } from "lodash";
import { ArrayParam, useQueryParams } from "use-query-params";
import { getFilterFacets } from "../../../api/api";
import { withIdToken } from "../../identity/AuthProvider";
import { filterParams } from "../files/FileTable";

export interface IFacetInfo {
    label: string;
    count: number;
    description?: string;
}
export interface IFacets {
    trial_ids: IFacetInfo[];
    facets: Dictionary<Dictionary<IFacetInfo[]> | IFacetInfo[]>;
}

export const filterConfig = {
    trial_ids: ArrayParam,
    facets: ArrayParam
};

export interface IFilters {
    trial_ids?: string[];
    facets?: string[];
}

export interface IFilterContext {
    facets?: IFacets;
    filters: IFilters;
    hasFilters: boolean;
    clearFilters: () => void;
    updateFilters: (k: keyof IFacets) => (v: string | string[]) => void;
}

export const FilterContext = React.createContext<IFilterContext>({
    facets: undefined,
    filters: {},
    hasFilters: false,
    clearFilters: () => undefined,
    updateFilters: () => () => undefined
});

export const ARRAY_PARAM_DELIM = "|";

export interface IFilterProviderProps {
    trialView?: boolean;
}

const FilterProvider: React.FC<IFilterProviderProps & { token: string }> = ({
    token,
    trialView,
    children
}) => {
    const [facets, setFacets] = React.useState<IFacets | undefined>();

    // For now, only show protocol identifier filters in the trial view
    const maybeFilteredFacets =
        trialView && facets
            ? ({ trial_ids: facets.trial_ids, facets: {} } as IFacets)
            : facets;

    const [filters, setFiltersInternal] = useQueryParams(filterConfig);
    const setFilters: typeof setFiltersInternal = updates => {
        const newFilters = { ...filters, ...updates };
        getFilterFacets(token, filterParams(newFilters)).then(newFacets => {
            setFacets(newFacets);
            // If any previously applied filters now have zero results under the
            // new filter set, remove those filters. This is to ensure a user can't
            // end up with a set of selected filters that yields empty search results.
            setFiltersInternal({
                trial_ids: newFilters.trial_ids,
                facets: newFilters.facets?.filter(facetString => {
                    const [cat, facet, subfacet] = facetString.split("|");
                    if (
                        newFacets.facets &&
                        newFacets.facets[cat] &&
                        newFacets.facets[cat][facet]
                    ) {
                        return (
                            newFacets.facets[cat][facet].count > 0 ||
                            newFacets.facets[cat][facet].filter(
                                (sf: IFacetInfo) =>
                                    sf.label === subfacet && sf.count > 0
                            ).length > 0
                        );
                    }
                    return true;
                })
            });
        });
    };

    // Auto-load facets on first render
    const firstRender = React.useRef<boolean>(true);
    React.useEffect(() => {
        if (firstRender.current) {
            getFilterFacets(token, filterParams(filters)).then(setFacets);
        }
        firstRender.current = false;
    }, [token, filters]);

    const hasFilters =
        Object.values(filters).filter(fs => {
            return fs && fs.length > 0;
        }).length > 0;
    const clearFilters = () => {
        const clearedFilters = Object.keys(filters).reduce(
            (f, k) => ({ ...f, [k]: undefined }),
            {}
        );
        setFilters(clearedFilters);
    };
    const toggleFilter = (k: keyof IFacets, v: string) => {
        const currentValues = filters[k] || [];
        const updatedValues = currentValues.includes(v)
            ? currentValues.filter(cv => cv !== v)
            : [...currentValues, v];
        setFilters({ [k]: updatedValues });
    };
    const updateFilters = (k: keyof IFacets) => (v: string | string[]) => {
        if (!facets) {
            return;
        }

        if (Array.isArray(v)) {
            const [category, facet, subfacet] = v;
            if (subfacet || Array.isArray(facets[k][category])) {
                toggleFilter(k, v.join(ARRAY_PARAM_DELIM));
            } else {
                const keyFilters = filters[k] || [];
                const facetFamily = [category, facet].join(ARRAY_PARAM_DELIM);
                const facetsInFamily: string[] = facets[k][category][facet]
                    .filter(({ count }: IFacetInfo) => count > 0)
                    .map((f: IFacetInfo) =>
                        [facetFamily, f.label].join(ARRAY_PARAM_DELIM)
                    );
                const hasAllFilters =
                    keyFilters.filter(f => f.startsWith(facetFamily)).length ===
                    facetsInFamily.length;
                const newFilters = hasAllFilters
                    ? keyFilters.filter(f => !f.startsWith(facetFamily))
                    : uniq([...keyFilters, ...facetsInFamily]);
                setFilters({ [k]: newFilters });
            }
        } else {
            toggleFilter(k, v);
        }
    };

    return (
        <FilterContext.Provider
            value={{
                facets: maybeFilteredFacets,
                filters,
                hasFilters,
                clearFilters,
                updateFilters
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilterFacets = () => {
    return React.useContext(FilterContext);
};

export default withIdToken<IFilterProviderProps>(FilterProvider);
