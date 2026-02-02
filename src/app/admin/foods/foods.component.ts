import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FoodsService, Food } from '../../core/services/foods.service';

@Component({
  selector: 'app-foods',
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Food Management</h2>
        <p-button label="Create Food" icon="pi pi-plus" (onClick)="createFood()" />
      </div>

      <!-- Search Input -->
      <p-iconField iconPosition="left" class="w-full md:w-96">
        <p-inputIcon styleClass="pi pi-search" />
        <input
          type="text"
          pInputText
          placeholder="Search foods..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch()"
          class="w-full"
        />
      </p-iconField>

      <!-- Filter Buttons -->
      <div class="flex gap-2">
        <p-button
          label="High Protein"
          icon="pi pi-filter"
          [outlined]="true"
          (onClick)="filterHighProtein()"
        />
        <p-button
          label="Low Calorie"
          icon="pi pi-filter"
          [outlined]="true"
          (onClick)="filterLowCalorie()"
        />
        <p-button
          label="Clear Filters"
          icon="pi pi-filter-slash"
          [text]="true"
          (onClick)="clearFilters()"
        />
      </div>

      <p-card class="rounded-xl shadow-sm">
        <p-table
          [value]="foods()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} foods"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Name <p-sortIcon field="name" />
              </th>
              <th pSortableColumn="calories">
                Calories <p-sortIcon field="calories" />
              </th>
              <th pSortableColumn="protein">
                Protein (g) <p-sortIcon field="protein" />
              </th>
              <th pSortableColumn="carbs">
                Carbs (g) <p-sortIcon field="carbs" />
              </th>
              <th pSortableColumn="fat">
                Fat (g) <p-sortIcon field="fat" />
              </th>
              <th pSortableColumn="category">
                Category <p-sortIcon field="category" />
              </th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-food>
            <tr>
              <td>{{ food.name }}</td>
              <td>{{ food.calories }}</td>
              <td>{{ food.protein }}</td>
              <td>{{ food.carbs }}</td>
              <td>{{ food.fat }}</td>
              <td>{{ food.category }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    (onClick)="editFood(food)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteFood(food)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8 text-surface-500">
                No foods found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: ``
})
export class FoodsComponent implements OnInit {
  private foodsService = inject(FoodsService);

  foods = signal<Food[]>([]);
  loading = signal(true);
  searchQuery = '';

  ngOnInit() {
    this.loadFoods();
  }

  loadFoods() {
    this.loading.set(true);
    this.foodsService.getFoods().subscribe({
      next: (foods) => {
        this.foods.set(foods);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.loading.set(true);
      this.foodsService.searchFoods(this.searchQuery).subscribe({
        next: (foods) => {
          this.foods.set(foods);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.loadFoods();
    }
  }

  filterHighProtein() {
    this.loading.set(true);
    this.foodsService.getHighProteinFoods().subscribe({
      next: (foods) => {
        this.foods.set(foods);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  filterLowCalorie() {
    this.loading.set(true);
    this.foodsService.getLowCalorieFoods().subscribe({
      next: (foods) => {
        this.foods.set(foods);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.loadFoods();
  }

  createFood() {
    console.log('Create food');
  }

  editFood(food: Food) {
    console.log('Edit food:', food);
  }

  deleteFood(food: Food) {
    console.log('Delete food:', food);
  }
}
