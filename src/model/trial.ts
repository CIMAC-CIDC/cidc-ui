// tslint:disable-next-line:interface-name
export interface Trial {
    _id: string;
    _etag: string;
    trial_id: string;
    // NOTE: these fields are not supported by the new API.
    // TODO: implement role-based access to Trial resources in the new API.
    collaborators: string[];
    locked: boolean;
}
