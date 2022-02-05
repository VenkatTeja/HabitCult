import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ValidationPortalComponent } from './dashboard/validation-portal/validation-portal.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreateGoalComponent } from './create-goal/create-goal.component';
import { GoalProgressComponent } from './goal-progress/goal-progress.component';
import { EndOfGoalComponent } from './end-of-goal/end-of-goal.component';
import { GlobalService } from './global.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    ValidationPortalComponent,
    HomeComponent,
    CreateGoalComponent,
    GoalProgressComponent,
    EndOfGoalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [GlobalService],
  bootstrap: [AppComponent],
})
export class AppModule {}
