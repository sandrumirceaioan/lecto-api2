import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Discount } from "./discounts.schema";

export type CategorieDiscount = "volum" | "inscriere" | "fidelitate";

export interface DiscountVolum {
    min_cursanti: number;
    max_cursanti?: number;
    type: "fix" | "procent";
    value: number;
}

export interface DiscountInscriere {
    max_inscriere: Date;
    type: "fix" | "procent";
    value: number;
}

export interface DiscountFidelitate {
    participare: number;
    consecutiva?: boolean;
    type: "fix" | "procent";
    value: number;
}

export interface DiscountsPaginated {
    discounts: Discount[];
    total: number;
}