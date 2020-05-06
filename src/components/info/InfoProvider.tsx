import * as React from "react";
import {
    getSupportedAssays,
    getSupportedManifests,
    getExtraDataTypes,
    getSupportedAnalyses
} from "../../api/api";

export interface IInfoContext {
    supportedTemplates: {
        manifests: string[];
        assays: string[];
        analyses: string[];
    };
    extraDataTypes: string[];
}

export const InfoContext = React.createContext<IInfoContext | undefined>(
    undefined
);

const InfoProvider: React.FunctionComponent = props => {
    const [assays, setAssays] = React.useState<string[] | undefined>(undefined);
    const [manifests, setManifests] = React.useState<string[] | undefined>(
        undefined
    );
    const [analyses, setAnalyses] = React.useState<string[] | undefined>(
        undefined
    );
    const [extraDataTypes, setExtraDataTypes] = React.useState<
        string[] | undefined
    >(undefined);

    React.useEffect(() => {
        getSupportedAssays().then(setAssays);
        getSupportedManifests().then(setManifests);
        getSupportedAnalyses().then(setAnalyses);
        getExtraDataTypes().then(setExtraDataTypes);
    }, []);

    const context =
        assays && manifests && analyses && extraDataTypes
            ? {
                  supportedTemplates: { assays, manifests, analyses },
                  extraDataTypes
              }
            : undefined;

    return (
        <InfoContext.Provider value={context}>
            {props.children}
        </InfoContext.Provider>
    );
};

export default InfoProvider;
