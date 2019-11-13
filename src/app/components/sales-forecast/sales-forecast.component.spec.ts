import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesForecastComponent } from './sales-forecast.component';

describe('SalesForecastComponent', () => {
  let component: SalesForecastComponent;
  let fixture: ComponentFixture<SalesForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
