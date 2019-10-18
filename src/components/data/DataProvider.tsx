import * as React from "react";
import { DataFile } from "../../model/file";
import { AuthContext } from "../identity/AuthProvider";
import { getFiles } from "../../api/api";
import Loader from "../generic/Loader";

export interface IDataContext {
    files: DataFile[];
    dataStatus: "fetching" | "fetched" | "failed";
    error: string;
    refreshData: () => void;
}

export const DataContext = React.createContext<IDataContext | undefined>(
    undefined
);

export const DataProvider: React.FunctionComponent = props => {
    const authContext = React.useContext(AuthContext);

    const [files, setFiles] = React.useState<DataFile[] | undefined>(undefined);
    const [dataStatus, setDataStatus] = React.useState<
        IDataContext["dataStatus"]
    >("fetching");
    const [error, setError] = React.useState<IDataContext["error"]>("");

    const refreshData = () => {
        if (authContext) {
            setDataStatus("fetching");
            getFiles(authContext.idToken)
                .then(fs => {
                    setFiles(fs);
                    setDataStatus("fetched");
                })
                .catch(err => {
                    setFiles([]);
                    setError(err.toString());
                    setDataStatus("failed");
                });
        }
    };

    React.useEffect(refreshData, []);

    const value = files && { files, dataStatus, error, refreshData };

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
