import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { UserLayoutComponent } from './layout/user-layout.component';
import { HomeComponent } from './pages/public/home.component';
import { LoginComponent } from './pages/public/login.component';
import { RegisterComponent } from './pages/public/register.component';
import { GuestRequestComponent } from './pages/public/guest-request.component';
import { TrackPublicComponent } from './pages/public/track-public.component';
import { StudentDashboardComponent } from './pages/user/student-dashboard.component';
import { BookAppointmentComponent } from './pages/user/book-appointment.component';
import { RequestsComponent } from './pages/user/requests.component';
import { ProfileComponent } from './pages/user/profile.component';
import { NotificationsComponent } from './pages/user/notifications.component';
import { DashboardComponent } from './pages/admin/dashboard.component';
import { ManageAppointmentsComponent } from './pages/admin/manage-appointments.component';
import { ManageRequestsComponent } from './pages/admin/manage-requests.component';
import { ReportsComponent } from './pages/admin/reports.component';
import { UsersComponent } from './pages/admin/users.component';
import { WalkinComponent } from './pages/admin/walkin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'guest-request', component: GuestRequestComponent },
  { path: 'track', component: TrackPublicComponent },
  {
    path: 'student',
    component: UserLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'book', component: BookAppointmentComponent },
      { path: 'requests', component: RequestsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointments', component: ManageAppointmentsComponent },
      { path: 'queue', component: ManageAppointmentsComponent },
      { path: 'requests', component: ManageRequestsComponent },
      { path: 'walkins', component: WalkinComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'app', redirectTo: 'student/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
