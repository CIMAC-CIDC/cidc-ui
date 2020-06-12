import React from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import FormStepHeader from "./FormStepHeader";
import FormStepFooter from "./FormStepFooter";
import BiospecimensWizard from "./BiospecimensWizard";
import Alert from "../../generic/Alert";

const BiospecimensStep: React.FC = () => {
    const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
    const [showWizard, setShowWizard] = React.useState<boolean>(false);

    return (
        <>
            <Grid container direction="column" spacing={1} alignItems="center">
                <Grid item>
                    <FormStepHeader
                        title="Valiate Biospecimens"
                        subtitle={
                            "Check metadata constraints on biospecimens collected over the course of this trial. Each row in this table represents either a biospecimen derived directly from study participants (i.e., biospecimens with no parent) or a biospecimen derived from another biospecimen (i.e., biospecimens with a parent)."
                        }
                    />
                    <Typography>
                        <strong>Note:</strong> it isn't yet possible to save new
                        biospecimens through this step of the form.
                    </Typography>
                </Grid>
                <Grid item>
                    {showWizard ? (
                        <BiospecimensWizard
                            onComplete={() => setShowWizard(false)}
                            onCancel={() => setAlertOpen(true)}
                        />
                    ) : (
                        <Button
                            size="large"
                            color="primary"
                            variant="contained"
                            onClick={() => setShowWizard(true)}
                        >
                            open the biospecimen validator
                        </Button>
                    )}
                </Grid>
            </Grid>
            <FormStepFooter backButton getValues={() => ({})} />
            <Alert
                open={alertOpen}
                title="Are you sure you want to abandon these changes?"
                description="Your progress will not be saved."
                onAccept={() => {
                    setShowWizard(false);
                    setAlertOpen(false);
                }}
                onCancel={() => setAlertOpen(false)}
            />
        </>
    );
};

export default BiospecimensStep;
