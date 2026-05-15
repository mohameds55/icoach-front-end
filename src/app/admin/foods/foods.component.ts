import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
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
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodsComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  foods = signal<Food[]>([]);
  loading = signal(true);
  page = signal(1);
  limit = signal(20);
  totalRecords = signal(0);

  searchQuery = '';
  minCalories: number | null = null;
  maxCalories: number | null = null;
  minProtein: number | null = null;

  dialogVisible = signal(false);
  dialogMode = signal<'create' | 'edit'>('create');
  saving = signal(false);
  selectedFood = signal<Food | null>(null);

  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    calories: [null as number | null, [Validators.required, Validators.min(0)]],
    protein: [null as number | null, [Validators.required, Validators.min(0)]],
    carbohydrate: [null as number | null, [Validators.required, Validators.min(0)]],
    fat: [null as number | null, [Validators.required, Validators.min(0)]],
    sugar: [null as number | null, Validators.min(0)],
  });

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
        if (page != null) this.page.set(page);
        if (limit != null) this.limit.set(limit);
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

  openCreateDialog() {
    this.dialogMode.set('create');
    this.selectedFood.set(null);
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  editFood(food: Food) {
    this.dialogMode.set('edit');
    this.selectedFood.set(food);
    this.imageFile.set(null);
    this.imagePreviewUrl.set(food.foodImage ?? null);
    this.form.reset({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbohydrate: food.carbohydrate,
      fat: food.fat,
      sugar: food.sugar ?? null,
    });
    this.dialogVisible.set(true);
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Please upload an image file.' });
      input.value = '';
      return;
    }

    this.imageFile.set(file);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  saveFood() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const fd = new FormData();
    fd.append('name', value.name!);
    fd.append('calories', String(value.calories!));
    fd.append('protein', String(value.protein!));
    fd.append('carbohydrate', String(value.carbohydrate!));
    fd.append('fat', String(value.fat!));
    if (value.sugar != null) fd.append('sugar', String(value.sugar));
    if (this.imageFile()) fd.append('foodImage', this.imageFile()!);

    if (this.dialogMode() === 'create') {
      this.foodsService.createFood(fd).subscribe({
        next: (food) => {
          this.foods.update((foods) => [food, ...foods]);
          this.totalRecords.update((t) => t + 1);
          this.dialogVisible.set(false);
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Food Created',
            detail: `${food.name} has been created successfully.`,
          });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create food. Please try again.',
          });
        },
      });
    } else {
      const food = this.selectedFood()!;
      this.foodsService.updateFood(food.id, fd).subscribe({
        next: (updated) => {
          this.foods.update((foods) => foods.map((f) => f.id === updated.id ? updated : f));
          this.dialogVisible.set(false);
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Food Updated',
            detail: `${updated.name} has been updated successfully.`,
          });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update food. Please try again.',
          });
        },
      });
    }
  }

  deleteFood(food: Food) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${food.name}"? This action cannot be undone.`,
      header: 'Delete Food',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.foodsService.deleteFood(food.id).subscribe({
          next: () => {
            this.foods.update((foods) => foods.filter((f) => f.id !== food.id));
            this.totalRecords.update((t) => Math.max(0, t - 1));
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${food.name} has been deleted.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete food. Please try again.',
            });
          },
        });
      },
    });
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
}
