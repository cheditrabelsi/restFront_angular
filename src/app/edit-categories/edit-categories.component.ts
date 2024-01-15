import { Component, Input, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { StoreService } from '../service/store/Store.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Category } from '../model/category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-categories',
  standalone: true,
  imports: [ReactiveFormsModule, CalendarModule],
  templateUrl: './edit-categories.component.html',
  styleUrl: './edit-categories.component.css'
})
export class EditCategoriesComponent implements OnInit {

  categoryForm: FormGroup = new FormGroup({
  
  })
  private toastService = inject(HotToastService);
  id: any
  cat!:Category
formatted_date:any
lib: string | undefined;

  constructor(private fb: FormBuilder, private StoreService: StoreService,private route:Router) { 
    this.categoryForm = this.fb.group({
      designationCat: ["", [Validators.required, Validators.minLength(3)]],
      date_created: [new Date(), Validators.required],
    });
  }

  ngOnInit(): void {
   
    this.id=localStorage.getItem("id")

    this.StoreService.getCategory(this.id).subscribe((data)=>{
    const date_created = new Date(data!.date_created);
    this.lib=data.designationCat
    console.log(this.lib)
    
     this.categoryForm = this.fb.group({
      designationCat: [this.lib, [Validators.required, Validators.minLength(3)]],
      date_created: [date_created.toISOString().split('T')[0], Validators.required],
    })
  })
  }
  onSubmit() {
    const formValue = this.categoryForm.value;
    const payload: any = {
      id_categorie: this.id,
      designationCat: formValue.designationCat,
      date_created: formValue.date_created,
    };
    this.StoreService.updateCategory(payload).subscribe(
      {
        next: (response) => {
          const index = this.StoreService.categories.findIndex((category) => category.id_categorie === this.id)
          this.StoreService.categories[index] = response
          this.toastService.success('Category Edited successfully')
          this.route.navigate(["/categories"])
        },
        error: (err) => {
          console.log(err)
        }
      }
      
    )
    

  }
  getCategory(id:any){
    this.StoreService.getCategory(id).subscribe((data)=>{
      this.cat=data;
      console.log(data)
    })
  }
}
