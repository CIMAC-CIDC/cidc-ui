import * as React from "react";
import {
    TextField,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    MenuItem,
    Typography,
    CircularProgress,
    makeStyles
} from "@material-ui/core";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import { createUser } from "../../api/api";
import { AuthContext } from "./AuthProvider";
import history from "./History";
import { colors } from "../../rootStyles";

export const useRegisterStyles = makeStyles({
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.LIGHT_BLUE,
        height: 48,
        fontSize: 24
    },
    progress: {
        textAlign: "center",
        paddingTop: 30
    }
});

export default function Register() {
    const classes = useRegisterStyles();
    const authData = React.useContext(AuthContext);

    const [state, setEntireState] = React.useState({
        first_n: "",
        last_n: "",
        email: "",
        organization: "EMPTY",
        firstNameError: false,
        lastNameError: false,
        organizationError: false,
        token: undefined
    });

    const setState = React.useCallback(
        (partialState: any) => setEntireState({ ...state, ...partialState }),
        [state]
    );

    React.useEffect(() => {
        if (authData) {
            setState({ token: authData.idToken, ...authData.user });
        }
    }, [authData, setState]);

    function handleFirstNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setState({ first_n: event.target.value });
    }

    function handleLastNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setState({ last_n: event.target.value });
    }

    function handleOrganizationChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        setState({ organization: event.target.value });
    }

    function handleClick() {
        const firstNameError: boolean = !state.first_n;
        const lastNameError: boolean = !state.last_n;
        const organizationError: boolean =
            !state.organization || state.organization === "EMPTY";

        setState({
            firstNameError,
            lastNameError,
            organizationError
        });

        if (!firstNameError && !lastNameError && !organizationError) {
            const newUser = {
                email: state.email,
                first_n: state.first_n,
                last_n: state.last_n,
                organization: state.organization
            };

            createUser(state.token!, newUser).then(() =>
                history.replace("/unactivated")
            );
        }
    }

    if (!authData) {
        return (
            <>
                <div className={classes.header}>Registration</div>
                <div className={classes.progress}>
                    <CircularProgress />
                </div>
            </>
        );
    }

    return (
        <div>
            <div className={classes.header}>Registration</div>
            <div style={{ width: "25%", margin: "auto", paddingTop: 25 }}>
                <Typography
                    style={{ fontSize: 18, width: "100%", margin: "auto" }}
                >
                    Please complete your CIMAC-CIDC Data Portal registration
                    request below.
                </Typography>
                <Grid container={true} spacing={3}>
                    <Grid item={true} xs={12}>
                        <TextField
                            label="Login Email"
                            style={{ minWidth: 420 }}
                            value={state.email}
                            disabled={true}
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            label="First Name"
                            style={{ minWidth: 420 }}
                            fullWidth={true}
                            value={state.first_n}
                            onChange={handleFirstNameChange}
                            margin="normal"
                            variant="outlined"
                            required={true}
                            error={state.firstNameError}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            label="Last Name"
                            style={{ minWidth: 420 }}
                            fullWidth={true}
                            value={state.last_n}
                            onChange={handleLastNameChange}
                            margin="normal"
                            variant="outlined"
                            required={true}
                            error={state.lastNameError}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FormControl
                            variant="outlined"
                            required={true}
                            margin="normal"
                            error={state.organizationError}
                            style={{ minWidth: 420 }}
                        >
                            <InputLabel>Organization</InputLabel>
                            <Select
                                value={state.organization}
                                onChange={(e: any) =>
                                    handleOrganizationChange(e)
                                }
                                input={<OutlinedInput labelWidth={100} />}
                            >
                                <MenuItem value="EMPTY">Please select</MenuItem>
                                <MenuItem value="DFCI">
                                    {ORGANIZATION_NAME_MAP.DFCI}
                                </MenuItem>
                                <MenuItem value="CIDC">
                                    {ORGANIZATION_NAME_MAP.CIDC}
                                </MenuItem>
                                <MenuItem value="ICAHN">
                                    {ORGANIZATION_NAME_MAP.ICAHN}
                                </MenuItem>
                                <MenuItem value="STANFORD">
                                    {ORGANIZATION_NAME_MAP.STANFORD}
                                </MenuItem>
                                <MenuItem value="ANDERSON">
                                    {ORGANIZATION_NAME_MAP.ANDERSON}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item={true} xs={12}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                // tslint:disable-next-line:jsx-no-lambda
                                onClick={() => handleClick()}
                            >
                                Register
                            </Button>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
