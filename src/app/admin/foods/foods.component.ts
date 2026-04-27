import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  FoodsService,
  Food,
  FoodsPaginatedResponse,
  FoodsQueryParams,
} from '../../core/services/foods.service';

interface PageEvent {
  first: number;
  rows: number;
}

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
  page = signal(1);
  limit = signal(20);
  totalRecords = signal(0);

  searchQuery = '';
  minCalories: number | null = null;
  maxCalories: number | null = null;
  minProtein: number | null = null;

  ngOnInit() {
    this.loadFoods();
  }

  loadFoods(overrideParams?: Partial<FoodsQueryParams>) {
    this.loading.set(true);

    const params: FoodsQueryParams = {
      page: overrideParams?.page ?? this.page(),
      limit: overrideParams?.limit ?? this.limit(),
      search: overrideParams?.search ?? this.searchQuery,
      minCalories: overrideParams?.minCalories ?? this.minCalories ?? undefined,
      maxCalories: overrideParams?.maxCalories ?? this.maxCalories ?? undefined,
      minProtein: overrideParams?.minProtein ?? this.minProtein ?? undefined,
    };

    this.foodsService.getFoods(params).subscribe({
      next: (response) => {
        const { foods, total, page, limit } = this.mapFoodsResponse(response);
        this.foods.set(foods);
        this.totalRecords.set(total);
        if (page != null) {
          this.page.set(page);
        }
        if (limit != null) {
          this.limit.set(limit);
        }
        this.loading.set(false);
      },
      error: () => {
        this.foods.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      },
    });
  }

  applyFilters() {
    this.page.set(1);
    this.loadFoods({ page: 1 });
  }

  onSearchInputChange() {
    this.page.set(1);
    this.loadFoods({ page: 1 });
  }

  clearFilters() {
    this.searchQuery = '';
    this.minCalories = null;
    this.maxCalories = null;
    this.minProtein = null;
    this.page.set(1);
    this.loadFoods({ page: 1 });
  }

  onPageChange(event: PageEvent) {
    const pageSizeChanged = event.rows !== this.limit();
    const page = pageSizeChanged ? 1 : Math.floor(event.first / event.rows) + 1;
    this.page.set(page);
    this.limit.set(event.rows);
    this.loadFoods({ page, limit: event.rows });
  }

  private mapFoodsResponse(response: Food[] | FoodsPaginatedResponse): {
    foods: Food[];
    total: number;
    page?: number;
    limit?: number;
  } {
    if (Array.isArray(response)) {
      return { foods: response, total: response.length };
    }

    const foods = response.foods ?? response.data ?? response.items ?? [];
    const total =
      response.pagination?.totalItems ??
      response.pagination?.total ??
      response.total ??
      response.totalCount ??
      foods.length;
    const page = response.pagination?.currentPage ?? response.pagination?.page ?? response.page;
    const limit = response.pagination?.itemsPerPage ?? response.pagination?.limit ?? response.limit;

    return { foods, total, page, limit };
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
