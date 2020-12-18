import * as React from "react";
import {
    Grid,
    Card,
    CardHeader,
    CardContent,
    Typography
} from "@material-ui/core";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { ErrorOutline } from "@material-ui/icons";

export interface IError {
    type: "Request Error" | "Login Error";
    message?: string;
    description?: React.ReactElement;
    details?: {
        // TODO: we can get more specific as we decide what's useful
        [k: string]: any;
    };
}

export const ErrorContext = React.createContext<(error: IError) => void>(
    (e: IError) => console.error(e)
);

// TODO: pre-populate email with error info, look into analytics for capturing UI error info automatically?
const ErrorGuard: React.FunctionComponent = ({ children }) => {
    const [error, setError] = React.useState<IError | undefined>(undefined);
    const errorSetter = (err: IError) => {
        const addedDetails = { ts: Date.now().toString() };
        const details = err.details
            ? { ...err.details, ...addedDetails }
            : addedDetails;
        setError({ ...err, details });
    };

    if (!error) {
        return (
            <ErrorContext.Provider value={errorSetter}>
                {children}
            </ErrorContext.Provider>
        );
    }

    const title = `${error.type}${error.message ? " - " + error.message : ""}`;
    return (
        <div data-testid="error-message">
            <ErrorContext.Provider value={errorSetter}>
                <Grid
                    container
                    justify="center"
                    alignItems="center"
                    style={{ height: "80vh" }}
                >
                    <Grid item>
                        <Card color="inherit">
                            <CardHeader
                                avatar={<ErrorOutline />}
                                title={title}
                            />
                            <CardContent>
                                <Typography>
                                    {error.description ? (
                                        error.description
                                    ) : (
                                        <>
                                            The CIDC Portal encountered a
                                            problem. Please{" "}
                                            <ContactAnAdmin lower /> if this
                                            issue persists.
                                        </>
                                    )}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </ErrorContext.Provider>
        </div>
    );
};

export default ErrorGuard;
