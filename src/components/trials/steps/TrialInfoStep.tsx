import React from "react";
import {
    Grid,
    FormControl,
    TextField,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Radio,
    GridProps
} from "@material-ui/core";
import { useFormContext, useForm, FormContext } from "react-hook-form";
import FormStepHeader from "./FormStepHeader";
import { useTrialFormContext, useTrialFormSaver } from "../TrialForm";
import FormStepFooter from "./FormStepFooter";

function makeInputField(name: string, label: string, isArray?: boolean) {
    return () => {
        const { trial } = useTrialFormContext();
        const { register, setValue } = useFormContext();
        React.useEffect(() => {
            register({ name });
        }, [register]);

        const [inputValue, setInputValue] = React.useState<string>(trial[name]);

        return (
            <TextField
                fullWidth
                multiline
                name={name}
                label={label}
                value={inputValue}
                onChange={({ target: { value } }) => {
                    setInputValue(value);
                    if (isArray) {
                        setInputValue(value);
                        const values = value.split(",").map(v => v.trim());
                        setValue(name, values);
                    } else {
                        setValue(name, value);
                    }
                }}
            />
        );
    };
}

const TrialStatusField = () => {
    const { trial } = useTrialFormContext();
    const { register } = useFormContext();
    const name = "trial_status";

    return (
        <FormControl component="fieldset">
            <FormLabel>Trial Status</FormLabel>
            <RadioGroup row name={name} defaultValue={trial[name]}>
                {["New", "Ongoing", "Completed"].map(v => (
                    <FormControlLabel
                        key={v}
                        label={v}
                        value={v}
                        name={name}
                        inputRef={register}
                        control={<Radio size="small" />}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

const fields: Array<{
    name: string;
    label?: string;
    component?: React.FC;
    isArray?: boolean;
    width: GridProps["xs"];
}> = [
    { name: "trial_name", label: "Trial Name", width: 12 },
    { name: "nci_id", label: "NCI Identifier", width: 4 },
    { name: "nct_id", label: "ClinicalTrials.gov ID (NCT number)", width: 4 },
    {
        name: "grant_of_affiliated_network",
        label: "Grant or Affiliated network",
        width: 4
    },
    { name: "trial_status", component: TrialStatusField, width: 4 },
    { name: "biobank", label: "Biobank", width: 8 },
    {
        name: "lead_cimac_pis",
        label: "Lead CIMAC PI(s)",
        isArray: true,
        width: 4
    },
    {
        name: "lead_cimac_contacts",
        label: "Lead CIMAC Contacts",
        isArray: true,
        width: 4
    },
    {
        name: "lead_trial_staff",
        label: "Lead Trial Staff",
        isArray: true,
        width: 4
    },
    { name: "justification", label: "Justification", width: 12 },
    { name: "biomarker_plan", label: "Biomarker Plan", width: 12 },
    { name: "data_sharing_plan", label: "Data Sharing Plan", width: 12 }
];

const fieldComponents = fields.map(field => {
    const Component =
        field.component ||
        makeInputField(field.name, field.label || "", field.isArray);
    return (
        <Grid item key={field.name} xs={field.width}>
            <Component />
        </Grid>
    );
});

const TrialInfoStep: React.FC = () => {
    const { nextStep, setHasChanged } = useTrialFormContext();
    const formInstance = useForm({ mode: "onBlur" });
    const getInfo = () => formInstance.getValues({ nest: true });

    useTrialFormSaver(() => formInstance.getValues({ nest: true }));

    return (
        <FormContext {...formInstance}>
            <form
                onSubmit={formInstance.handleSubmit(() => {
                    nextStep(formInstance.getValues);
                })}
                onChange={() => setHasChanged(true)}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormStepHeader
                            title="Trial Information"
                            subtitle="General background on this trial that should be available in its clinical trial plan."
                        />
                    </Grid>
                    {fieldComponents}
                </Grid>
                <FormStepFooter
                    nextButton
                    getValues={getInfo}
                    handleSubmit={formInstance.handleSubmit}
                />
            </form>
        </FormContext>
    );
};

export default TrialInfoStep;
