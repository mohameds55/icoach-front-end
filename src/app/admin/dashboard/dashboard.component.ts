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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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
