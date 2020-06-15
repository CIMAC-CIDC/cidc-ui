/* Silly client-side ID generation for MVP trial management */

const randomString = (length: number) =>
    Math.random()
        .toString(36)
        .substring(2, 2 + length);

const PARTICIPANT_PART_LENGTH = 3;
const BIOSPECIMEN_PART_LENGTH = 3;
const MAX_TRIES = 100;

export const generateParticipantID = (
    trialId: string,
    existingIds: Set<string>
) => {
    let newId;
    let count = 0;
    while (!newId || existingIds.has(newId)) {
        if (count > MAX_TRIES) {
            throw Error("Could not generate unique CIDC participant id");
        }
        const participantStr = randomString(PARTICIPANT_PART_LENGTH);
        newId = `CIDC-${trialId}-${participantStr}`;
        count++;
    }
    return newId;
};

export const generateBiospecimenID = (
    participantId: string,
    existingIds: Set<string>
) => {
    let newId;
    let count = 0;
    while (!newId || existingIds.has(newId)) {
        if (count > MAX_TRIES) {
            throw Error("Could not generate unique CIDC biospecimen id");
        }
        const biospecimenStr = randomString(BIOSPECIMEN_PART_LENGTH);
        newId = `${participantId}-${biospecimenStr}`;
        count++;
    }
    return newId;
};
