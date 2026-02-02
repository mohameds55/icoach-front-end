import { Component, OnInit, signal, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { UsersService } from '../../core/services/users.service';
import { WorkoutsService } from '../../core/services/workouts.service';
import { FoodsService } from '../../core/services/foods.service';
import { SavedWorkoutsService } from '../../core/services/saved-workouts.service';
import { forkJoin } from 'rxjs';

interface StatCard {
  title: string;
  icon: string;
  count: number;
  loading: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, SkeletonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      @for (card of statCards(); track card.title) {
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-surface-500 dark:text-surface-400 text-sm mb-2">
                {{ card.title }}
              </div>
              @if (card.loading) {
                <p-skeleton width="4rem" height="2rem" />
              } @else {
                <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                  {{ card.count }}
                </div>
              }
            </div>
            <div class="flex items-center justify-center w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <i [class]="card.icon + ' text-3xl text-primary-600 dark:text-primary-400'"></i>
            </div>
          </div>
        </p-card>
      }
    </div>
  `,
  styles: ``
})
export class DashboardComponent implements OnInit {
  private usersService = inject(UsersService);
  private workoutsService = inject(WorkoutsService);
  private foodsService = inject(FoodsService);
  private savedWorkoutsService = inject(SavedWorkoutsService);

  statCards = signal<StatCard[]>([
    { title: 'Users', icon: 'pi pi-users', count: 0, loading: true },
    { title: 'Workouts', icon: 'pi pi-bolt', count: 0, loading: true },
    { title: 'Foods', icon: 'pi pi-apple', count: 0, loading: true },
    { title: 'Saved Workouts', icon: 'pi pi-bookmark', count: 0, loading: true }
  ]);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    forkJoin({
      users: this.usersService.getUsersCount(),
      workouts: this.workoutsService.getWorkoutsCount(),
      foods: this.foodsService.getFoodsCount(),
      savedWorkouts: this.savedWorkoutsService.getSavedWorkoutsCount()
    }).subscribe({
      next: (results) => {
        this.statCards.set([
          { title: 'Users', icon: 'pi pi-users', count: results.users.count, loading: false },
          { title: 'Workouts', icon: 'pi pi-bolt', count: results.workouts.count, loading: false },
          { title: 'Foods', icon: 'pi pi-apple', count: results.foods.count, loading: false },
          { title: 'Saved Workouts', icon: 'pi pi-bookmark', count: results.savedWorkouts.count, loading: false }
        ]);
      },
      error: () => {
        this.statCards.update(cards => cards.map(card => ({ ...card, loading: false })));
      }
    });
  }
}
