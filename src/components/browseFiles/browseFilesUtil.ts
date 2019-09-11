import { DataFile } from "../../model/file";

export function filterFiles(
    files: DataFile[],
    selectedTrialIds: string[],
    selectedExperimentalStrategies: string[],
    selectedDataFormats: string[],
    searchFilter: string
): DataFile[] {
    return files.filter((file: DataFile) => {
        let isTrialIdMatch = true;
        let isExperimentalStrategyMatch = true;
        let isDataFormatMatch = true;
        let isSearchFilterMatch = true;
        if (selectedTrialIds.length > 0) {
            isTrialIdMatch = selectedTrialIds.includes(file.trial);
        }
        if (selectedExperimentalStrategies.length > 0) {
            isExperimentalStrategyMatch = selectedExperimentalStrategies.includes(
                file.assay_type
            );
        }
        if (selectedDataFormats.length > 0) {
            isDataFormatMatch = selectedDataFormats.includes(file.data_format);
        }
        if (searchFilter.length > 0) {
            isSearchFilterMatch = file.object_url
                .toLowerCase()
                .includes(searchFilter.toLowerCase());
        }
        return (
            isTrialIdMatch &&
            isExperimentalStrategyMatch &&
            isDataFormatMatch &&
            isSearchFilterMatch
        );
    });
}

export function changeOption(
    selectedOptions: string[],
    option: string
): string[] {
    if (selectedOptions.includes(option)) {
        return selectedOptions.filter((selectedOption: string) => {
            return selectedOption !== option;
        });
    } else {
        return [...selectedOptions, option];
    }
}
