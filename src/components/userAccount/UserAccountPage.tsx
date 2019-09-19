import * as React from "react";
import {
    Toolbar,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Grid
} from "@material-ui/core";
import "./UserAccount.css";
import { getPermissions } from "../../api/api";
import AdminMenu from "./AdminMenu";
import {
    LOCALE,
    DATE_OPTIONS,
    ORGANIZATION_NAME_MAP
} from "../../util/constants";
import Permission from "../../model/permission";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { AuthContext } from "../../identity/AuthProvider";
import { useUserContext } from "../../identity/UserProvider";

export default function UserAccountPage() {
    const authData = React.useContext(AuthContext);
    const userAccount = useUserContext();

    const [permissions, setPermissions] = React.useState<
        Permission[] | undefined
    >(undefined);

    React.useEffect(() => {
        if (authData && authData.idToken) {
            getPermissions(authData.idToken).then(setPermissions);
        }
    }, [authData]);

    const isAdmin = userAccount && userAccount.role === "cidc-admin";
    const hasPerms = permissions && permissions.length > 0;

    return (
        <div>
            <Paper className="User-account-paper">
                <Toolbar className="User-account-toolbar">
                    <Typography className="User-account-toolbar-text">
                        User Account
                    </Typography>
                </Toolbar>
                <div className="User-details">
                    {!userAccount || !permissions ? (
                        <div className="User-account-progress">
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            <div>
                                <Typography variant="h5">
                                    Registration Form and Code of Conduct:
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="textSecondary"
                                    paragraph
                                >
                                    {new Date(
                                        userAccount._created
                                    ).toLocaleString(LOCALE, DATE_OPTIONS)}
                                </Typography>
                                <Typography variant="h5">
                                    Organization:
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="textSecondary"
                                    paragraph
                                >
                                    {
                                        ORGANIZATION_NAME_MAP[
                                            userAccount.organization
                                        ]
                                    }
                                </Typography>
                            </div>
                            <div>
                                <div>
                                    <Typography variant="h5">
                                        Dataset Access:
                                    </Typography>
                                    <Grid container spacing={8}>
                                        {isAdmin ? (
                                            <Grid item>
                                                <Typography
                                                    variant="h5"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    As an admin, you have access
                                                    to all datasets.
                                                </Typography>
                                            </Grid>
                                        ) : hasPerms ? (
                                            permissions.map(perm => {
                                                return (
                                                    <Grid
                                                        item
                                                        key={
                                                            perm.trial +
                                                            perm.assay_type
                                                        }
                                                    >
                                                        <Chip
                                                            label={`${
                                                                perm.trial
                                                            }: ${
                                                                perm.assay_type
                                                            }`}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item>
                                                <Typography
                                                    variant="h5"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    You do not have access to
                                                    any datasets.{" "}
                                                    <ContactAnAdmin /> if you
                                                    believe this is a mistake.
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Paper>
            {userAccount && authData && userAccount.role === "cidc-admin" && (
                <AdminMenu token={authData.idToken} userId={userAccount.id} />
            )}
        </div>
    );
}
