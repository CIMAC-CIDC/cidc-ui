// TODO: should we be getting this from the API?
type Role =
    | "cidc-admin"
    | "cidc-biofx-user"
    | "cimac-biofx-user"
    | "cimac-user"
    | "developer"
    | "devops"
    | "nci-biobank-user"
    | "system"
    | "network-viewer";

type Organization = "CIDC" | "DFCI" | "ICAHN" | "STANFORD" | "ANDERSON";

// tslint:disable-next-line:interface-name
export interface UnregisteredAccount {
    email: string;
    picture?: string;
    first_n?: string;
    last_n?: string;
}

// tslint:disable-next-line:interface-name
export interface Account extends UnregisteredAccount {
    _etag: string;
    _created: string;
    _updated: string;
    id: number;
    organization: Organization;
    disabled: boolean;
    contact_email?: string;
    approval_date?: string;
    role?: Role;
    last_access?: string;
}
