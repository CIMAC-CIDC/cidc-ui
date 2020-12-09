import * as React from "react";
import useSWR from "swr";

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
    const { data: assays } = useSWR(["/info/assays"]);
    const { data: manifests } = useSWR(["/info/manifests"]);
    const { data: analyses } = useSWR(["/info/analyses"]);
    const { data: extraDataTypes } = useSWR(["/info/extra_data_types"]);

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
