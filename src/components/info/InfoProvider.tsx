import * as React from "react";
import { getSupportedAssays, getSupportedManifests } from "../../api/api";

export interface IInfoContext {
    supportedTemplates: {
        manifests: string[];
        metadata: string[];
    };
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

    React.useEffect(() => {
        getSupportedAssays().then(assaysRes =>
            getSupportedManifests().then(manifestsRes => {
                setMetadata(assaysRes);
                setManifests(manifestsRes);
            })
        );
    }, []);

    const context =
        metadata && manifests
            ? { supportedTemplates: { metadata, manifests } }
            : undefined;

    return (
        <InfoContext.Provider value={context}>
            {props.children}
        </InfoContext.Provider>
    );
};

export default InfoProvider;
