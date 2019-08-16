// tslint:disable-next-line:interface-name
export interface File {
    id: number;
    trial: string;
    file_name: string;
    object_url: string;
    uploaded_timestamp: Date;
    file_size_bytes: number;
    artifact_category: string;
    assay_category: string;
    file_type: string;
    download_link?: string;
}
