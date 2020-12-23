export interface Client {
    id: number;
    clientName: string;
    contactName: string;
    contactJobTitle: string;
    contactCompany: string;
    contactEmail: string;
    contactTelephone: string;
    contactMobile: string;
    telephone: string;
    logo: string;
    created: Date;
    updated: Date;
    brands: Array<any>;
    categories: Array<any>;
    subcategories: Array<any>;
    topics: Array<any>;
    clienttypes: Array<any>;
}
