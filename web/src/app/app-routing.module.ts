import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth-guard';
import { CreateGoalComponent } from './create-goal/create-goal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GoalProgressComponent } from './goal-progress/goal-progress.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'create-goal',
    component: CreateGoalComponent,
  },
  {
    path: 'goal-progress',
    component: GoalProgressComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
