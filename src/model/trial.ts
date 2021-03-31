// tslint:disable-next-line:interface-name
export interface Trial {
    _etag: string;
    _updated?: string;
    _created?: string;
    id: number;
    trial_id: string;
    metadata_json: any;
    file_bundle?: IFileBundle;
    // TODO: implement role-based access to Trial resources in the new API.
    // TODO: add missing fields (e.g., assays, participants) to this object.
}

export type NewTrial = Omit<Omit<Trial, "_etag">, "id">;

export interface IFileBundle {
    [assay: string]: {
        source?: number[];
        analysis?: number[];
        clinical?: number[];
        miscellaneous?: number[];
    };
}

export interface ITrialOverview {
    trial_id: string;
    file_size_bytes: number;
    [assay: string]: number | string;
}
