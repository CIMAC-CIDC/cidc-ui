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
    Box,
    Card,
    CardContent,
    CardHeader
} from "@material-ui/core";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import { AuthContext, logout } from "./AuthProvider";
import { RouteComponentProps } from "react-router-dom";
import { apiCreate } from "../../api/api";
import { UnregisteredAccount } from "../../model/account";

const Register: React.FC<RouteComponentProps> = ({ history }) => {
    const auth = React.useContext(AuthContext);

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
        if (auth.state === "logged-in") {
            const { userInfo } = auth;
            if (!hasPrepopulated) {
                setState({ ...userInfo.user, token: userInfo.idToken });
                setHasPrepopulated(true);
            } else {
                setState({ token: userInfo.idToken });
            }
        }
    }, [auth, setState, hasPrepopulated]);

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

            apiCreate<UnregisteredAccount>("/users/self", state.token!, {
                data: newUser
            }).then(() => history.replace("/"));
        }
    }

    if (auth.state === "loading") {
        return null;
    }

    return (
        <Box margin="auto" width={600}>
            <Card>
                <CardHeader title="Registration has been temporarily disabled" />
            </Card>
        </Box>
    );
};

export default Register;
