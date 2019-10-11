import * as React from "react";
import { Trial } from "../../model/trial";
import { DataFile } from "../../model/file";
import { AuthContext } from "../identity/AuthProvider";
import { getTrials, getFiles } from "../../api/api";
import Loader from "../generic/Loader";

export interface IDataContext {
    trials: Trial[];
    files: DataFile[];
    dataStatus: "fetching" | "fetched" | "failed";
    refreshData: () => void;
}

export const DataContext = React.createContext<IDataContext | undefined>(
    undefined
);

export const DataProvider: React.FunctionComponent = props => {
    const authContext = React.useContext(AuthContext);

    const [trials, setTrials] = React.useState<Trial[] | undefined>(undefined);
    const [files, setFiles] = React.useState<DataFile[] | undefined>(undefined);
    const [dataStatus, setDataStatus] = React.useState<
        IDataContext["dataStatus"]
    >("fetching");

    const refreshData = () => {
        if (authContext) {
            setDataStatus("fetching");
            Promise.all([
                getTrials(authContext.idToken).then(ts => setTrials(ts)),
                getFiles(authContext.idToken).then(fs => setFiles(fs))
            ])
                .then(() => setDataStatus("fetched"))
                .catch(() => setDataStatus("failed"));
        }
    };

    React.useEffect(refreshData, []);

    const value = trials && files && { trials, files, dataStatus, refreshData };

    return (
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    );
};

export function withData<T>(
    Component: React.ComponentType<T>
): React.ComponentType<T & IDataContext> {
    return props => (
        <DataContext.Consumer>
            {dataContext =>
                dataContext ? (
                    <Component {...props} {...dataContext} />
                ) : (
                    <Loader />
                )
            }
        </DataContext.Consumer>
    );
}

export default DataProvider;
