export interface Users {
    role: "admin" | "user";
    email: string;
    passowrd: string;
}

export interface Formator {
    nume: string;
    experienta: string[];
}

export interface Participant {
    type: "institutie_publica" | "agent_economic" | "persoana_fizica";
    curs: string;

    // daca e institutie
    institutie_publica: {
        denumire_institutie: string;
        reprezentant_legal: {
            first_name: string;
            last_name: string;
        };
        adresa_institutie: string;
        telefon_institutie: string;
        email_institutie: string;
        cui: string;
        insotitor_extra: string;
    };

    // daca e agent economic
    agent_economic: {
        denumire_societate: string;
        reprezentant_legal: {
            first_name: string;
            last_name: string;
        };
        adresa_societate: string;
        telefon_societate: string;
        email_societate: string;
        cui: string;
        j: string;
    };

    // date persoana inscrisa la curs
    persoana_fizica: {
        first_name: string;
        last_name: string;
        cnp: string;
        adresa: string;
        telefon: string;
        email: string;
        ultima_scoala_absolvita: "liceu" | "facultate" | "master";
        curs_perfectionare_initiere: string;
        locatie_desfasurare: string;
        perioada_desfasurare: string;
    }

    acceptare_termeni: boolean;
}


export interface Curs {
    titlu: string;
    descriere: string;
    sesiuni: string[]; // id-uri de sesiune
}

export interface Sesiune {
    type: "online" | "local";
    curs_online?: SesiuneOnline;
    curs_local?: SesiuneLocal;
    formatori: Formator[];
}

export interface SesiuneOnline {
    discount: DiscountCurs[];
    discounts: {
        procent: number;
        conditie: string;
    };
    certificare: {
        anc: boolean;
        participare: boolean;
    };
    pret: {
        anc?: number;
        participare?: number;
    };
    inscriere: {
        start: Date;
        end: Date;
    };
    perioada: {
        start: Date;
        end: Date;
    };
}

export interface SesiuneLocal {
    discount: DiscountCurs[];
    certificare: {
        anc: boolean;
        participare: boolean;
    };
    pret: {
        anc?: number;
        participare?: number;
    };
    locatie: string; // id Locatie
    inscriere: {
        start: Date;
        end: Date;
    };
    perioada: {
        start: Date;
        end: Date;
    };
}

export interface Locatie {
    locatie: string; // hotel international
    imagine: string; // imagine hotel international
    descriere: string; // descriere hotel international
    statiune: string; // statiunea pentru hotel international
    oras: string; // orasul in care este hotelul international
    judet: string; // judetul in care este hotelul international
    oferte: OfertaLocatie[];
    active: boolean;
}

export interface OfertaLocatie {
    nume: string; // 6 nopti demipensiune, 7 nopti demipensiune, 6 nopti pensiune completa, 7 nopti pensiune completa
    pret: number; // 4090
}

export interface DiscountCurs {
    categorie: "volum" | "inscriere" | "fidelitate";
    volum?: { min_cursanti: number; max_cursanti?: number; type: "fix" | "procent"; value: number; }
    inscriere: { max_inscriere: Date; type: "fix" | "procent"; value: number; }
    fidelitate: { participare: number; consecutiva?: boolean; type: "fix" | "procent"; value: number; }
    descriere: string;
}
