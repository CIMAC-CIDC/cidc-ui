import { DATE_OPTIONS, LOCALE } from "./constants";
import filesize from "filesize";

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(LOCALE, DATE_OPTIONS);
};

export const formatFileSize = (bytes: number) => {
    return filesize(bytes);
};

export const formatDataCategory = (dataCategory: string) => {
    return dataCategory
        .split("|")
        .join(" ")
        .trim();
};
