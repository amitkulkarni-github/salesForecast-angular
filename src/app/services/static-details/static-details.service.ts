import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as models from 'src/app/models/Models'
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class StaticDetailsService {

  constructor(private http: HttpClient) { }

  public getChannels(): Promise<models.Channel[]> {
    return this.http.get<models.Channel[]>(environment.apiEndpoint + '/channels')
      .toPromise();
  }
  public getProducts(): Promise<models.Product[]> {
    return this.http.get<models.Product[]>(environment.apiEndpoint + '/products')
      .toPromise();
  }

  public getChannelProducts(): Promise<models.ChannelProduct[]> {
    return this.http.get<models.ChannelProduct[]>(environment.apiEndpoint + '/channelProducts')
      .toPromise();
  }

  public getForecastMethods(): Promise<models.ForecastMethod[]> {
    return this.http.get<models.ForecastMethod[]>(environment.apiEndpoint + '/forecastMethods')
      .toPromise();
  }


  // from local json file
  // this.http.get<model.Channel[]>('assets/channels.json').subscribe(result => {
  //   _staticDetails.channels = result;
  // });
  // this.http.get<model.ChannelProduct[]>('assets/channelProducts.json').subscribe(result => {
  //   _staticDetails.channelProducts =result;
  // });
  // this.http.get<model.Product[]>('assets/products.json').subscribe(result => {
  //   _staticDetails.products = result;
  // })

  // this.http.get<model.ForecastMethod[]>('assets/forecastMethods.json').subscribe(result => {
  //   _staticDetails.forecastMethods = result;
  // })



}
