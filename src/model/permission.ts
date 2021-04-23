// tslint:disable-next-line:interface-name
export default interface Permission {
    id: number;
    _etag: string;
    granted_by_user: number;
    granted_to_user: number;
    trial_id: string | null;
    upload_type: string | null;
}
