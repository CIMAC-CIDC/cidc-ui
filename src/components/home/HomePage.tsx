import * as React from "react";
import {
    Typography,
    Grid,
    Button,
    Box,
    Link,
    Divider,
    makeStyles
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
import pactLogo from "../../pact_logo.svg";
import fnihLogo from "../../fnih_logo.svg";
import nciLogo from "../../nci_logo.svg";

const usePortalStatStyles = makeStyles(theme => ({
    icon: {
        fontSize: "4.5rem",
        color: theme.palette.primary.main
    },
    value: {
        fontSize: "1.6rem",
        fontWeight: "bold"
    },
    label: {
        fontSize: "1rem"
    }
}));

const PortalStat: React.FC<{
    label: string;
    value?: string | number;
    Icon: typeof AssignmentOutlined;
}> = ({ label, value, Icon }) => {
    const classes = usePortalStatStyles();
    return (
        <Grid container alignItems="center" spacing={1}>
            <Grid item>
                <Icon className={classes.icon} />
            </Grid>
            <Grid item>
                <Typography
                    aria-labelledby={label}
                    className={classes.value}
                    variant="h4"
                >
                    {value || "-"}
                </Typography>
                <Typography
                    id={label}
                    className={classes.label}
                    variant="overline"
                >
                    {label}
                </Typography>
            </Grid>
        </Grid>
    );
};

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
                    <Grid item>
                        <PortalStat
                            label="trials"
                            value={dataOverview?.num_trials}
                            Icon={AssignmentOutlined}
                        />
                    </Grid>
                    <Grid item>
                        <PortalStat
                            label="participants"
                            value={dataOverview?.num_participants}
                            Icon={PersonOutlined}
                        />
                    </Grid>
                    <Grid item>
                        <PortalStat
                            label="samples"
                            value={dataOverview?.num_samples}
                            Icon={OpacityOutlined}
                        />
                    </Grid>
                    <Grid item>
                        <PortalStat
                            label="assays"
                            value={dataOverview?.num_assays}
                            Icon={AssessmentOutlined}
                        />
                    </Grid>
                    <Grid item>
                        <PortalStat
                            label="files"
                            value={dataOverview?.num_files}
                            Icon={FileCopyOutlined}
                        />
                    </Grid>
                    <Grid item>
                        <PortalStat
                            label="data"
                            value={
                                dataOverview
                                    ? filesize(dataOverview.num_bytes, {
                                          round: 1
                                      })
                                    : undefined
                            }
                            Icon={StorageOutlined}
                        />
                    </Grid>
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
