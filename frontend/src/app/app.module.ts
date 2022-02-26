import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ValidationPortalComponent } from './dashboard/validation-portal/validation-portal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreateGoalComponent } from './create-goal/create-goal.component';
import { GoalProgressComponent } from './goal-progress/goal-progress.component';
import { EndOfGoalComponent } from './end-of-goal/end-of-goal.component';
import { GlobalService } from './global.service';
import { UpcomingTasksComponent } from './goal-progress/upcoming-tasks/upcoming-tasks.component';
import { HistoryComponent } from './goal-progress/history/history.component';
import { ContractService } from './services/contract.service';
import { MetamaskMissingComponent } from './metamask-missing/metamask-missing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    ValidationPortalComponent,
    CreateGoalComponent,
    GoalProgressComponent,
    EndOfGoalComponent,
    UpcomingTasksComponent,
    HistoryComponent,
    MetamaskMissingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [GlobalService, ContractService],
  bootstrap: [AppComponent],
})
export class AppModule {}
