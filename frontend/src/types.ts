export interface Item {
    id: string;
    name: string;
    section: string;
    quantity: number;
    bought: boolean;
}

export interface List {
    id: string;
    name: string;
    items?:  Item[];
}