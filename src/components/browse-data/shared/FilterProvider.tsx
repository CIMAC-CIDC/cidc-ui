import { Dictionary, uniq } from "lodash";
import React from "react";
import { ArrayParam, useQueryParams } from "use-query-params";
import { getFilterFacets } from "../../../api/api";
import { withIdToken } from "../../identity/AuthProvider";

export interface IFacetInfo {
    label: string;
    description?: string;
}
export interface IFacets {
    trial_ids: string[];
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
    React.useEffect(() => {
        getFilterFacets(token).then(setFacets);
    }, [token]);
    // For now, only show protocol identifier filters in the trial view
    const maybeFilteredFacets =
        trialView && facets
            ? ({ trial_ids: facets.trial_ids, facets: {} } as IFacets)
            : facets;

    const [filters, setFilters] = useQueryParams(filterConfig);
    const hasFilters =
        Object.values(filters).filter(fs => {
            return fs && fs.length > 0;
        }).length > 0;
    const clearFilters = () => {
        Object.keys(filters).forEach(k => setFilters({ [k]: undefined }));
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
                const facetsInFamily: string[] = facets[k][category][
                    facet
                ].map((f: IFacetInfo) =>
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
