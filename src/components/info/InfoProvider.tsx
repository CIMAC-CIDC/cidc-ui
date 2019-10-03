import * as React from "react";
import {
    getSupportedAssays,
    getSupportedManifests,
    getExtraDataTypes
} from "../../api/api";

export interface IInfoContext {
    supportedTemplates: {
        manifests: string[];
        metadata: string[];
    };
    extraDataTypes: string[];
}

export const InfoContext = React.createContext<IInfoContext | undefined>(
    undefined
);

const InfoProvider: React.FunctionComponent = props => {
    const [metadata, setMetadata] = React.useState<string[] | undefined>(
        undefined
    );
    const [manifests, setManifests] = React.useState<string[] | undefined>(
        undefined
    );
    const [extraDataTypes, setExtraDataTypes] = React.useState<
        string[] | undefined
    >(undefined);

    React.useEffect(() => {
        getSupportedAssays().then(setMetadata);
        getSupportedManifests().then(setManifests);
        getExtraDataTypes().then(setExtraDataTypes);
    }, []);

    const context =
        metadata && manifests && extraDataTypes
            ? { supportedTemplates: { metadata, manifests }, extraDataTypes }
            : undefined;

    return (
        <InfoContext.Provider value={context}>
            {props.children}
        </InfoContext.Provider>
    );
};

export default InfoProvider;
