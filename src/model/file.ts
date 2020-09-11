import { Dictionary } from "lodash";

// tslint:disable-next-line:interface-name
export interface DataFile {
    id: number;
    trial_id: string;
    file_name: string;
    object_url: string;
    uploaded_timestamp: Date;
    file_size_bytes: number;
    artifact_category: string;
    upload_type: string;
    file_ext?: string;
    data_category?: string;
    additional_metadata?: {
        [prop: string]: any;
    };
    clustergrammer?: JSON;
    ihc_combined_plot: Array<Dictionary<string | number>>;
}
