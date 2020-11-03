import { DATE_OPTIONS, LOCALE } from "./constants";
import filesize from "filesize";

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
