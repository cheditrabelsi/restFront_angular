import { Category } from "./category";

export interface Product {

    id_produit: number;
    designation: string;
    prix: number;
    qte: number;
    url:string;
    categorie: Category;
}
