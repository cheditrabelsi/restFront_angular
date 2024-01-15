import { Component, inject } from '@angular/core';
import { StoreService } from '../service/store/Store.service';
import { Category } from '../model/category';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Product } from '../model/Product';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoginComponent,FormsModule],
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.css'
})
export class AddProductsComponent {
  
  categories: Category[] = []
  products: Product[] = []
  productForm: FormGroup = new FormGroup({});
  editMode: boolean = false;
  cat!:Category
  private toastService = inject(HotToastService);
  private id: number = 0;


  constructor(private StoreService: StoreService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      lib: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0)]],
      qte: [0, [Validators.required, Validators.min(0)]],
      url: ['', [Validators.required]],
      categories: ['', [Validators.required]]
    })
    this.StoreService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    })
    this.StoreService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
    })
  }
  notEmptyString(control: AbstractControl) {
    return control.value && control.value.trim() !== '' ? null : { notEmptyString: true };
  }
  getLastPartOfPath(path: string | null): string {
    if (path) {
      const parts = path.split('\\'); // Remplacez '\\' par '/' selon votre cas
      return parts[parts.length - 1];
    }
    return ''; // Ou une autre valeur par défaut si nécessaire
  }
  incrementQte() {
    this.productForm.get('qte')?.setValue(this.productForm.get('qte')?.value + 1);
  }

  decrementQte() {
    if (this.productForm.get('qte')?.value > 1) {
      this.productForm.get('qte')?.setValue(this.productForm.get('qte')?.value - 1);
    }
  }
  onSubmit() {
    const formValue = this.productForm.value;
    console.log("qte",this.productForm.value.qte)
    console.log("form",formValue)
    this.StoreService.getCategory(formValue.categories).subscribe((data)=>{
      console.log("data",data)
      const payload: any = {
      designation: formValue.lib,
      prix: formValue.prix,
      qte: formValue.qte,
      categorie: data,
      url:formValue.url
    };
      if (!this.editMode) {
      console.log(payload)
      this.StoreService.addProduct(payload).subscribe({
        next: (response) => {
          this.toastService.success('Project added successfully')
          this.products.push(response);
          this.productForm.reset();

        },
        error: (err) => {
          this.toastService.error(err.error.message)
        }
      })
    } else {
      payload.id_produit = this.id;
      console.log("product",payload)
      this.StoreService.updateProduct(payload).subscribe({
        next: (response) => {
          this.toastService.success('Project Edited successfully')
          const index = this.products.findIndex(product => product.id_produit === response.id_produit);
          this.products[index] = response;
          this.productForm.reset();
          this.editMode = false;
        },
        error: (err) => {
          this.toastService.error(err.error.message)
        }
      })
      this.scrollToSection("listeProduit")
    }
    })
  }
  onDelete(id: number) {
    this.StoreService.deleteProduct(id).subscribe({
      next: (response) => {
        this.toastService.success('Product deleted successfully')
        this.products = this.products.filter(product => product.id_produit !== id);
      },
      error: (err) => {
        this.toastService.error(err.error.message)
      }
    })
  }

  onEdit(id: number,p:string) {
    this.scrollToSection(p)
    this.editMode = true
    this.id = id;
    console.log(id)
    this.StoreService.getProduct(id).subscribe({
      next: (response) => {
         console.log("resulata",response)
        this.productForm.patchValue({
          lib: response.designation,
          prix: response.prix,
          qte: response.qte,
          categories: response.categorie.id_categorie,  
        })
      },
      error: (err) => {
        this.toastService.error(err.error.message)
      }
    })
  }
  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}