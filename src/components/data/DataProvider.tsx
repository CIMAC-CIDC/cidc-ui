import * as React from "react";
import { DataFile } from "../../model/file";
import { AuthContext } from "../identity/AuthProvider";
import { getFiles } from "../../api/api";
import Loader from "../generic/Loader";
import { UserContext } from "../identity/UserProvider";

export interface IDataContext {
    files: DataFile[];
    dataStatus: "fetching" | "fetched" | "failed";
    refreshData: () => void;
}

export const DataContext = React.createContext<IDataContext | undefined>(
    undefined
);

export const DataProvider: React.FunctionComponent = props => {
    const authContext = React.useContext(AuthContext);
    const userContext = React.useContext(UserContext);

    const [files, setFiles] = React.useState<DataFile[] | undefined>(undefined);
    const [dataStatus, setDataStatus] = React.useState<
        IDataContext["dataStatus"]
    >("fetching");

    const refreshData = () => {
        // Only try to fetch data if user has been approved
        if (authContext && userContext && userContext.role) {
            setDataStatus("fetching");
            getFiles(authContext.idToken)
                .then(fs => {
                    setFiles(fs.data);
                    setDataStatus("fetched");
                })
                .catch(() => setDataStatus("failed"));
        }
    };

    React.useEffect(refreshData, [
        authContext && userContext && userContext.role
    ]);

    const value = files && { files, dataStatus, refreshData };

    return (
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    );
};

export function withData<T>(
    Component: React.ComponentType<T & IDataContext>
): React.ComponentType<T> {
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
