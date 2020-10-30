import * as React from "react";
import {
    Typography,
    Grid,
    Button,
    Box,
    Link,
    Divider
} from "@material-ui/core";
import { useRootStyles } from "../../rootStyles";
import { getDataOverview, IDataOverview } from "../../api/api";
import filesize from "filesize";
import {
    AssessmentOutlined,
    AssignmentOutlined,
    FileCopyOutlined,
    OpacityOutlined,
    OpenInNewOutlined,
    PersonOutlined,
    StorageOutlined
} from "@material-ui/icons";
import { RouteComponentProps } from "react-router-dom";
import { colors } from "../../rootStyles";
import pactLogo from "../../pact_logo.svg";
import fnihLogo from "../../fnih_logo.svg";
import nciLogo from "../../nci_logo.svg";

const HomePage: React.FunctionComponent<RouteComponentProps> = ({
    history
}) => {
    const classes = useRootStyles();

    const [dataOverview, setDataOverview] = React.useState<
        IDataOverview | undefined
    >(undefined);
    React.useEffect(() => {
        getDataOverview().then(d => setDataOverview(d));
    }, []);

    return (
        <Grid
            className={classes.centeredPage}
            container
            direction="column"
            alignItems="stretch"
        >
            <Grid item>
                <Box paddingTop={6} paddingBottom={10}>
                    <Typography
                        align="center"
                        variant="h3"
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Cancer Immunologic Data Commons
                    </Typography>
                    <Typography
                        align="center"
                        variant="h5"
                        color="textSecondary"
                    >
                        A hub for cutting-edge cancer immune monitoring and
                        analysis data
                    </Typography>
                </Box>
            </Grid>
            <Grid item>
                <Grid
                    container
                    justify="space-between"
                    alignItems="baseline"
                    wrap="nowrap"
                >
                    {([
                        [
                            "trials",
                            dataOverview?.num_trials,
                            AssignmentOutlined
                        ],
                        [
                            "participants",
                            dataOverview?.num_participants,
                            PersonOutlined
                        ],
                        ["samples", dataOverview?.num_samples, OpacityOutlined],
                        [
                            "assays",
                            dataOverview?.num_assays,
                            AssessmentOutlined
                        ],
                        ["files", dataOverview?.num_files, FileCopyOutlined],
                        [
                            "data",
                            dataOverview
                                ? filesize(dataOverview.num_bytes, { round: 1 })
                                : undefined,
                            StorageOutlined
                        ]
                    ] as Array<
                        [
                            string,
                            string | undefined,
                            typeof AssignmentOutlined | undefined
                        ]
                    >).map(([label, value, Icon]) => {
                        return (
                            <Grid key={label} item>
                                <Grid container alignItems="center" spacing={1}>
                                    <Grid item>
                                        {Icon && (
                                            <Icon
                                                style={{
                                                    fontSize: "4.5rem",
                                                    color: colors.logoDarkBlue
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            variant="h4"
                                            style={{
                                                fontSize: "1.6rem",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            {value || "-"}
                                        </Typography>
                                        <Typography
                                            variant="overline"
                                            style={{
                                                fontSize: "1rem"
                                            }}
                                        >
                                            {label}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>
                <Button
                    disableElevation
                    fullWidth
                    color="primary"
                    variant="contained"
                    onClick={() => history.push("/browse-data")}
                    endIcon={<OpenInNewOutlined />}
                    style={{ marginTop: "1rem", fontSize: "1.2rem" }}
                >
                    explore the data
                </Button>
            </Grid>
            <Grid item>
                <Box paddingTop={8} paddingBottom={5}>
                    <Divider />
                </Box>
                <Box textAlign="center" paddingBottom={10}>
                    <Typography
                        variant="overline"
                        style={{ fontSize: "1.2rem" }}
                    >
                        What is the CIDC?
                    </Typography>
                    <Typography paragraph variant="h5" align="left">
                        The CIDC serves as the central data coordination portal
                        for the{" "}
                        <Link
                            href="https://cimac-network.org"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            CIMAC-CIDC Network
                        </Link>
                        , an NCI Cancer Moonshot initiative that provides
                        cutting-edge technology and expertise in genomic,
                        proteomic, and functional molecular analysis to enhance
                        clinical trials in cancer immune therapies.
                    </Typography>
                </Box>
            </Grid>
            <Grid item>
                <Grid
                    container
                    justify="center"
                    alignItems="center"
                    spacing={9}
                >
                    <Grid item>
                        <Link
                            target="_blank"
                            rel="noreferrer noopener"
                            href="https://fnih.org/what-we-do/programs/partnership-for-accelerating-cancer-therapies"
                        >
                            <img alt="PACT logo" src={pactLogo} />
                        </Link>
                    </Grid>
                    <Grid item>
                        <Link
                            target="_blank"
                            rel="noreferrer noopener"
                            href="https://www.cancer.gov/"
                        >
                            <img alt="NCI logo" src={nciLogo} />
                        </Link>
                    </Grid>
                    <Grid item>
                        <Link
                            target="_blank"
                            rel="noreferrer noopener"
                            href="https://fnih.org/"
                        >
                            <img alt="FNIH logo" src={fnihLogo} />
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default HomePage;
