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
    makeStyles
} from "@material-ui/core";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import { createUser } from "../../api/api";
import { AuthContext } from "./AuthProvider";
import history from "./History";
import { colors } from "../../rootStyles";
import Loader from "../generic/Loader";

export const useRegisterStyles = makeStyles({
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.LIGHT_BLUE,
        height: 48,
        fontSize: 24
    },
    body: { width: 700, margin: "auto", paddingTop: 25 },
    text: { fontSize: 18 }
});

export default function Register() {
    const classes = useRegisterStyles();
    const authData = React.useContext(AuthContext);

    const [hasPrepopulated, setHasPrepopulated] = React.useState<boolean>(
        false
    );
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
        (partialState: any) => {
            setEntireState({ ...state, ...partialState });
        },
        // React's linter complains about spread elements in dependency arrays,
        // but we bypass in this case to avoid having a very long dependency array.
        // eslint-disable-next-line
        Object.values(state)
    );

    React.useEffect(() => {
        if (authData) {
            if (!hasPrepopulated) {
                setState({ ...authData.user, token: authData.idToken });
                setHasPrepopulated(true);
            } else {
                setState({ token: authData.idToken });
            }
        }
    }, [authData, setState, hasPrepopulated]);

    const handleChange = (
        field: string,
        event: React.ChangeEvent<{ value: any }>
    ) => {
        setState({ [field]: event.target.value });
    };

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
                <div className={classes.header}>CIDC Registration Request</div>
                <Loader />
            </>
        );
    }

    return (
        <div>
            <div className={classes.header}>CIDC Registration Request</div>
            <div className={classes.body}>
                <Typography className={classes.text}>
                    If you are interested in accessing the CIMAC-CIDC Data
                    Portal, please complete your registration request below.
                </Typography>
                <Grid container={true} spacing={3} direction="column">
                    <Grid item={true}>
                        <TextField
                            label="Contact Email"
                            value={state.email}
                            disabled={true}
                            fullWidth={true}
                            margin="normal"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item={true}>
                        <TextField
                            label="First Name"
                            fullWidth={true}
                            value={state.first_n}
                            onChange={e => handleChange("first_n", e)}
                            margin="normal"
                            variant="outlined"
                            required={true}
                            error={state.firstNameError}
                        />
                    </Grid>
                    <Grid item={true}>
                        <TextField
                            label="Last Name"
                            fullWidth={true}
                            value={state.last_n}
                            onChange={e => handleChange("last_n", e)}
                            margin="normal"
                            variant="outlined"
                            required={true}
                            error={state.lastNameError}
                        />
                    </Grid>
                    <Grid item={true}>
                        <FormControl
                            variant="outlined"
                            fullWidth
                            required={true}
                            margin="normal"
                            error={state.organizationError}
                            style={{ minWidth: 420 }}
                        >
                            <InputLabel>Organization</InputLabel>
                            <Select
                                value={state.organization}
                                onChange={e => handleChange("organization", e)}
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
                    <Grid item={true}>
                        <Grid container justify="space-between">
                            <Grid item>
                                <Button
                                    variant="contained"
                                    onClick={() => history.push("/logout")}
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleClick()}
                                >
                                    Register
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
