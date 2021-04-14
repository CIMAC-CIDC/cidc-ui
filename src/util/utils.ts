import { DATE_OPTIONS, LOCALE } from "./constants";
import filesize from "filesize";
import { reduce } from "lodash";

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(LOCALE, DATE_OPTIONS);
};

export const formatFileSize = (
    bytes: number,
    options: Parameters<typeof filesize>[1] = {}
) => {
    return filesize(bytes, { base: 10, ...options });
};

export const formatDataCategory = (dataCategory: string) => {
    return dataCategory
        .split("|")
        .join(" ")
        .trim();
};

export const formatQueryString = (
    params: Record<string, string | boolean | number | undefined | null>
) => {
    return reduce(
        params,
        (qs, v, k) => (v ? (qs ? `${qs}&${k}=${v}` : `${k}=${v}`) : qs),
        ""
    );
};

export const naivePluralize = (str: string, n: number) => {
    return n !== 1 ? str + "s" : str;
};
