import * as React from "react";
import {
    Typography,
    Chip,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Link,
    Box
} from "@material-ui/core";
import AdminUserManager from "./AdminUserManager";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { withIdToken } from "../identity/AuthProvider";
import { useUserContext } from "../identity/UserProvider";
import { AccountCircle, FolderShared } from "@material-ui/icons";
import Loader from "../generic/Loader";
import { useRootStyles } from "../../rootStyles";
import AdminTrialManager from "./AdminTrialManager";
import { formatDate } from "../../util/utils";
import DashFrame from "../generic/DashFrame";

const ProfilePage: React.FC<{ token: string }> = ({ token }) => {
    const classes = useRootStyles();

    const userAccount = useUserContext();

    const isAdmin = userAccount?.role === "cidc-admin";
    const isNCI = userAccount?.role === "nci-biobank-user";
    const permissions = userAccount?.permissions || [];

    return !userAccount?.approval_date ? (
        <Loader />
    ) : (
        <Grid
            container
            direction="column"
            spacing={3}
            className={classes.centeredPage}
        >
            <Grid item>
                <Grid container spacing={3} alignItems="stretch" wrap="nowrap">
                    <Grid item xs={5}>
                        <Card style={{ height: "100%" }}>
                            <CardHeader
                                avatar={<AccountCircle />}
                                title={
                                    <Grid
                                        container
                                        justify="space-between"
                                        alignItems="center"
                                    >
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                        >
                                            Personal Info
                                        </Typography>
                                        <Link href="/logout">Logout</Link>
                                    </Grid>
                                }
                            />
                            <CardContent>
                                <Grid container direction="column" spacing={1}>
                                    <Grid item>
                                        <Typography>
                                            {userAccount.first_n}{" "}
                                            {userAccount.last_n}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography>
                                            {userAccount.email}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography>
                                            {
                                                ORGANIZATION_NAME_MAP[
                                                    userAccount.organization
                                                ]
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography>
                                            Joined on{" "}
                                            {formatDate(
                                                userAccount.approval_date
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={7}>
                        <Card style={{ height: "100%" }}>
                            <CardHeader
                                avatar={<FolderShared />}
                                title={
                                    <Typography
                                        variant="h6"
                                        color="textSecondary"
                                    >
                                        Dataset Access
                                    </Typography>
                                }
                            />
                            <CardContent>
                                {isAdmin || isNCI ? (
                                    <Typography>
                                        Your role (
                                        <code>{userAccount.role}</code>) gives
                                        you access to all datasets.
                                    </Typography>
                                ) : permissions.length ? (
                                    <Grid container spacing={2}>
                                        {permissions.map(perm => {
                                            return (
                                                <Grid
                                                    item
                                                    key={
                                                        perm.trial_id +
                                                        perm.upload_type
                                                    }
                                                >
                                                    <Chip
                                                        label={`${perm.trial_id}: ${perm.upload_type}`}
                                                    />
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                ) : (
                                    <Typography>
                                        You haven't been granted access to any
                                        datasets yet. Please{" "}
                                        <ContactAnAdmin lower /> with what
                                        trials and assay types you need to
                                        access, and we'll configure your
                                        permissions accordingly.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
            {token && userAccount?.role === "cidc-admin" && (
                <>
                    <Grid item>
                        <AdminUserManager />
                    </Grid>
                    <Grid item>
                        <AdminTrialManager />
                    </Grid>
                    <Grid item>
                        <Typography variant="h5">
                            Successful upload jobs (rendered by Plotly Dash)
                        </Typography>
                        <Box height={400}>
                            <DashFrame dashboardId="upload_jobs" />
                        </Box>
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default withIdToken(ProfilePage);
