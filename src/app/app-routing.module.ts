import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesForecastComponent } from 'src/app/components/sales-forecast/sales-forecast.component'
import { AboutComponent } from 'src/app/components/about/about.component'

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'about', component : AboutComponent },
  { path: '**', component: SalesForecastComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
