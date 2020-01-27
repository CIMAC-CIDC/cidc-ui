// tslint:disable-next-line:interface-name
export default interface Permission {
    id: number;
    _etag: string;
    by_user: number;
    to_user: number;
    trial: string;
    upload_type: string;
}
