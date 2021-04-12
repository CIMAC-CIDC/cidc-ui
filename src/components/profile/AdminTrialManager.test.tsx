import { fireEvent } from "@testing-library/react";
import React from "react";
import { renderWithUserContext } from "../../../test/helpers";
import { apiFetch, apiCreate, apiupdate, apiUpdate } from "../../api/api";
import AdminTrialManager from "./AdminTrialManager";
jest.mock("../../api/api");

const trial1 = {
    _etag: "some-etag",
    trial_id: "test-trial-0",
    metadata_json: {
        participants: [{}, {}, {}],
        assays: [{}, {}, {}],
        protocol_identifier: "test-trial-0",
        trial_name: "trial testing something interesting!",
        trial_status: "New",
        biobank: "cool new biobank",
        allowed_collection_event_names: ["a", "b", "c"],
        allowed_cohort_names: []
    }
};
const trial2 = {
    trial_id: "test-trial-1",
    metadata_json: {
        protocol_identifier: "test-trial-1",
        participants: [],
        allowed_collection_event_names: [],
        allowed_cohort_names: []
    }
};
const trials = [trial1, trial2];

const mockFetch = (ts = trials) => {
    apiFetch.mockImplementation(async (url: string) => {
        if (url.endsWith(trial1.trial_id)) {
            return trial1;
        } else if (url.endsWith(trial2.trial_id)) {
            return trial2;
        }
        return { _items: ts, _meta: { total: ts.length } };
    });
};

beforeEach(() => {
    mockFetch();
});

const renderTrialManager = () =>
    renderWithUserContext(<AdminTrialManager />, {});

it("renders available trials and trial creation button", async () => {
    const { findByText, queryByText } = renderTrialManager();
    expect(await findByText(/create a new trial/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-0/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-1/i)).toBeInTheDocument();
});

it("handles trial creation", async () => {
    const newTrialId = "new-trial-name";
    apiCreate
        .mockRejectedValueOnce({
            response: {
                data: { _error: { message: "violates unique constraint" } }
            }
        })
        .mockRejectedValueOnce({
            response: { data: { _error: { message: "some other error" } } }
        })
        .mockResolvedValueOnce({ ...trial2, trial_id: newTrialId });

    const {
        findByText,
        queryByText,
        getByText,
        getByLabelText
    } = renderTrialManager();
    const openFormButtonText = /create a new trial/i;
    const infoText = /please provide the unique identifier/i;

    // open the trial creation form
    fireEvent.click(await findByText(openFormButtonText));
    expect(queryByText(infoText)).toBeInTheDocument();
    expect(queryByText(openFormButtonText)).not.toBeInTheDocument();

    // click "cancel" to close the form
    fireEvent.click(getByText(/cancel/i));
    expect(queryByText(infoText)).not.toBeInTheDocument();

    // reopen the form
    fireEvent.click(getByText(openFormButtonText));

    // blocks submitting empty trial_ids
    const submitButton = getByText(/submit/i);
    fireEvent.submit(submitButton);
    expect(await findByText(/this is a required field/i)).toBeInTheDocument();
    expect(apiCreate).not.toHaveBeenCalled();

    // input a value
    const input = getByLabelText(/protocol identifier/i);
    fireEvent.input(input, { target: { value: newTrialId } });
    expect(input.value).toBe(newTrialId);

    // displays api errors appropriately:
    // * non-unique error
    fireEvent.submit(submitButton);
    expect(
        await findByText(/protocol identifier already exists/i)
    ).toBeInTheDocument();
    expect(apiCreate).toHaveBeenCalledTimes(1);
    // * unexpected error
    fireEvent.submit(submitButton);
    expect(await findByText(/unexpected error/i)).toBeInTheDocument();
    expect(apiCreate).toHaveBeenCalledTimes(2);

    // successful submission closes the creation form and refreshes trial list
    expect(apiFetch.mock.calls.length).toBeGreaterThan(0);
    fireEvent.submit(submitButton);
    expect(await findByText(openFormButtonText)).toBeInTheDocument();
    expect(queryByText(infoText)).not.toBeInTheDocument();
    expect(apiFetch.mock.calls.length).toBeGreaterThan(1);
});

it("handles trial editing and updates", async () => {
    mockFetch([trial1]);
    const updatedTrial = {
        ...trial1,
        metadata_json: {
            ...trial1.metadata_json,
            nct_id: "new nct id",
            trial_status: "Ongoing",
            allowed_collection_event_names: ["1", "2", "3"]
        }
    };
    apiUpdate.mockResolvedValue(updatedTrial);

    const { findByText, getByLabelText, getByText } = renderTrialManager();
    const trialAccordion = await findByText(new RegExp(trial1.trial_id, "i"));
    expect(trialAccordion).toBeInTheDocument();

    // expand the accordion
    fireEvent.click(trialAccordion);

    // check that already entered metadata values are present
    const trialName = getByLabelText(/trial name/i);
    expect(trialName.value).toBe(trial1.metadata_json.trial_name);
    const collectionEvents = getByLabelText(/collection event names/i);
    expect(collectionEvents.value).toBe(
        trial1.metadata_json.allowed_collection_event_names.join(",")
    );

    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);

    // update the collection events, add an NCT identifier, and set the trial status
    fireEvent.input(collectionEvents, { target: { value: "1, 2 ,  3 " } });
    const nctIdInput = getByLabelText(/nct number/i);
    fireEvent.input(nctIdInput, {
        target: { value: updatedTrial.metadata_json.nct_id }
    });
    const ongoingRadio = getByLabelText(/ongoing/i);
    fireEvent.click(ongoingRadio);
    expect(submitButton.disabled).toBe(false);

    // ensure values were updated
    expect(nctIdInput.value).toBe(updatedTrial.metadata_json.nct_id);
    expect(ongoingRadio.checked).toBe(true);

    // submit the changes
    fireEvent.submit(submitButton);
    expect(await findByText(/changes saved/i)).toBeInTheDocument();

    // after successful submit, submit button is disabled and reads "changes saved!"
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.innerHTML).toContain("changes saved!");

    // edited values were passed to the API correctly
    expect(apiUpdate).toHaveBeenCalledWith(
        `/trial_metadata/${trial1.trial_id}`,
        "test-token",
        {
            etag: trial1._etag,
            data: { metadata_json: updatedTrial.metadata_json }
        }
    );

    // edited values still appear in the trial editing form
    expect(nctIdInput.value).toBe(updatedTrial.metadata_json.nct_id);
    expect(ongoingRadio.checked).toBe(true);
});

it("handles discarding trial edits", async () => {
    mockFetch([trial1]);

    const {
        findByText,
        getByText,
        queryByText,
        getByLabelText
    } = renderTrialManager();
    // expand the trial accordion
    fireEvent.click(await findByText(new RegExp(trial1.trial_id, "i")));

    // check that trial name is displayed and trials status is unset
    const trialNameInput = getByLabelText(/trial name/i);
    const [newRadio, ongoingRadio] = ["New", "Ongoing"].map(l =>
        getByLabelText(l)
    );
    expect(newRadio.checked).toBe(true);
    expect(ongoingRadio.checked).toBe(false);
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    expect(queryByText(/discard changes/i)).not.toBeInTheDocument();

    // update the trial name and trial status
    fireEvent.input(trialNameInput, { target: { value: "new trial name" } });
    expect(trialNameInput.value).toBe("new trial name");
    fireEvent.click(ongoingRadio);
    expect(ongoingRadio.checked).toBe(true);
    expect(newRadio.checked).toBe(false);
    expect(submitButton.disabled).toBe(false);

    // discard the changes
    const discardButton = getByText(/discard changes/i);
    fireEvent.click(discardButton);

    // check that values were reset
    expect(trialNameInput.value).toBe(trial1.metadata_json.trial_name);
    expect(ongoingRadio.checked).toBe(false);
    expect(newRadio.checked).toBe(true);

    // check that buttons were reset
    expect(submitButton.disabled).toBe(true);
    expect(discardButton).not.toBeInTheDocument();
});

it("displays API errors produced while editing trials", async () => {
    mockFetch([trial1]);
    const errorMessage = "uh oh";
    apiUpdate.mockRejectedValue({ response: { data: errorMessage } });

    const { findByText, getByText, getByLabelText } = renderTrialManager();
    // expand the trial accordion
    fireEvent.click(await findByText(new RegExp(trial1.trial_id, "i")));

    // edit the some value
    fireEvent.input(getByLabelText(/trial name/i), {
        target: { value: "foo" }
    });

    // api error should display after submission
    fireEvent.submit(getByText(/save changes/i));
    expect(await findByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
});
