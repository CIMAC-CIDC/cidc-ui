// TODO: should we be getting this from the API?
type Role =
    | "cidc-admin"
    | "cidc-biofx-user"
    | "cimac-biofx-user"
    | "cimac-user"
    | "developer"
    | "devops"
    | "nci-biobank-user"
    | "system";

type Organization = "CIDC" | "DFCI" | "ICAHN" | "STANFORD" | "ANDERSON";

// tslint:disable-next-line:interface-name
export interface UnregisteredAccount {
    email: string;
    first_n?: string;
    last_n?: string;
}

// tslint:disable-next-line:interface-name
export interface Account extends UnregisteredAccount {
    _etag: string;
    _created: string;
    _updated: string;
    id: number;
    approval_date?: string;
    disabled: boolean;
    role?: Role;
    last_access?: string;
    organization: Organization;
}
