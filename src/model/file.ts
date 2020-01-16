import { Dictionary } from "lodash";

// tslint:disable-next-line:interface-name
export interface DataFile {
    id: number;
    trial: string;
    file_name: string;
    object_url: string;
    uploaded_timestamp: Date;
    file_size_bytes: number;
    artifact_category: string;
    assay_type: string;
    data_format: string;
    additional_metadata?: {
        [prop: string]: any;
    };
    clustergrammer?: JSON;
    ihc_barplot: IHCBarplotJSON;
}

export interface IHCBarplotJSON {
    meta: {
        facets: string[];
        tps_column: string;
    };
    data: Array<Dictionary<string | number>>;
}
