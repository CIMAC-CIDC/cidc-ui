// tslint:disable-next-line:interface-name
export interface Trial {
    _etag: string;
    id: number;
    trial_id: string;
    metadata_json: any;
    // TODO: implement role-based access to Trial resources in the new API.
    // TODO: add missing fields (e.g., assays, participants) to this object.
}

export type NewTrial = Omit<Omit<Trial, "_etag">, "id">;
