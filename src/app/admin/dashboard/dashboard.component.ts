import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { UsersService, User } from '../../core/services/users.service';
import { WorkoutsService } from '../../core/services/workouts.service';
import { FoodsService } from '../../core/services/foods.service';
import { SavedWorkoutsService } from '../../core/services/saved-workouts.service';
import { forkJoin } from 'rxjs';

interface StatCard {
  title: string;
  value: string;
  period: string;
  description: string;
  loading: boolean;
}

interface ActivityItem {
  initials: string;
  color: string;
  name: string;
  action: string;
  item: string;
  time: string;
  value: string;
  valueClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private usersService = inject(UsersService);
  private workoutsService = inject(WorkoutsService);
  private foodsService = inject(FoodsService);
  private savedWorkoutsService = inject(SavedWorkoutsService);

  statCards = signal<StatCard[]>([
    { title: 'Active Users', value: '0', period: 'Week', description: 'Users active in the last 7 days', loading: true },
    { title: 'New Signups', value: '0', period: 'Today', description: 'Admins & Coaches registered', loading: true },
    { title: 'Completed Workouts', value: '0', period: 'Weekly', description: 'Logged by clients and coaches', loading: true },
    { title: 'Foods Tracked', value: '0', period: 'Weekly', description: 'Client nutrition tracking', loading: true },
  ]);

  activityItems = signal<ActivityItem[]>([
    { initials: 'ML', color: '#c8a97a', name: 'Maya Lopez', action: 'completed', item: 'Full Body Strength', time: '30 minutes ago • Coach: Jordan Kim', value: '+220 kcal', valueClass: 'value-kcal' },
    { initials: 'CA', color: '#8da8c5', name: 'Coach Aaron', action: 'published', item: 'Mobility Flow', time: '2 hours ago', value: 'Published', valueClass: 'value-published' },
    { initials: 'EP', color: '#b5c8a0', name: 'Ethan Park', action: 'added', item: 'Avocado Toast', time: 'yesterday', value: '+450 kcal', valueClass: 'value-kcal' },
  ]);

  private trendMain = [28, 32, 30, 38, 42, 48, 52, 55, 60, 65, 70, 72, 78, 85];
  private trendSec = [18, 20, 19, 22, 20, 22, 21, 23, 20, 22, 24, 21, 23, 22];
  readonly mainLinePath = this.buildPath(this.trendMain, 360, 120, false);
  readonly mainAreaPath = this.buildPath(this.trendMain, 360, 120, true);
  readonly secondaryLinePath = this.buildPath(this.trendSec, 360, 120, false);

  users = signal<User[]>([]);
  usersLoading = signal(true);
  userSearch = signal('');

  displayedUsers = computed(() => {
    const s = this.userSearch().toLowerCase();
    return this.users()
      .filter(u => !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
      .slice(0, 5);
  });

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  private loadStats() {
    forkJoin({
      users: this.usersService.getUsersCount(),
      workouts: this.workoutsService.getWorkoutsCount(),
      foods: this.foodsService.getFoodsCount(),
      savedWorkouts: this.savedWorkoutsService.getSavedWorkoutsCount(),
    }).subscribe({
      next: (r) => {
        this.statCards.set([
          { title: 'Active Users', value: r.users.count.toLocaleString(), period: 'Week', description: 'Users active in the last 7 days', loading: false },
          { title: 'New Signups', value: r.savedWorkouts.count.toLocaleString(), period: 'Today', description: 'Admins & Coaches registered', loading: false },
          { title: 'Completed Workouts', value: r.workouts.count.toLocaleString(), period: 'Weekly', description: 'Logged by clients and coaches', loading: false },
          { title: 'Foods Tracked', value: r.foods.count.toLocaleString(), period: 'Weekly', description: 'Client nutrition tracking', loading: false },
        ]);
      },
      error: () => {
        this.statCards.update(cards => cards.map(c => ({ ...c, loading: false })));
      },
    });
  }

  private loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false),
    });
  }

  private buildPath(points: number[], width: number, height: number, fill: boolean): string {
    const px = 4, py = 8;
    const w = width - px * 2;
    const h = height - py * 2;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const rng = max - min || 1;
    const n = points.length - 1;
    const pts = points.map((p, i) => ({
      x: px + (i / n) * w,
      y: py + h - ((p - min) / rng) * h,
    }));
    let d = pts.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    if (fill) {
      d += ` L${(px + w).toFixed(1)},${(py + h).toFixed(1)} L${px},${(py + h).toFixed(1)} Z`;
    }
    return d;
  }
}
