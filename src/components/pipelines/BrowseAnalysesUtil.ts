import { Analysis } from "../../model/analysis";

export function filterAnalyses(
    analyses: Analysis[],
    selectedTrialIds: string[],
    selectedExperimentalStrategies: string[],
    selectedStatuses: string[]
): Analysis[] {
    return analyses.filter((analysis: Analysis) => {
        let isTrialIdMatch = true;
        let isExperimentalStrategyMatch = true;
        let isStatusMatch = true;
        if (selectedTrialIds.length > 0) {
            isTrialIdMatch = selectedTrialIds.includes(analysis.trial_id);
        }
        if (selectedExperimentalStrategies.length > 0) {
            isExperimentalStrategyMatch = selectedExperimentalStrategies.includes(
                analysis.assay_category
            );
        }
        if (selectedStatuses.length > 0) {
            isStatusMatch = selectedStatuses.includes(analysis.status);
        }
        return isTrialIdMatch && isExperimentalStrategyMatch && isStatusMatch;
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
