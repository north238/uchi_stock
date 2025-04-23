import { Config } from "ziggy-js";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    group_id?: number;
    line_id?: string;
    is_password_set?: boolean;
    group?: Group;
}

export interface Group {
    id: number;
    name: string;
    description: string;
    status: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    group: Group;
    ziggy: Config & { location: string };
};
