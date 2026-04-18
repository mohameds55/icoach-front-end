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
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss'
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
