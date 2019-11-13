import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as models from 'src/app/models/Models'
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  constructor(private http: HttpClient) { }

  public async GetForecast(params: models.InputParams): Promise<models.SalesDataCollection> {
    let _inputParams = {
      "channelId": params.channelId,
      "productId": params.productId,
      "historyStartDate": moment(params.historyStartDate).format(moment.HTML5_FMT.DATE),
      "historyEndDate": moment(params.historyEndDate).format(moment.HTML5_FMT.DATE),
      "forecastStartDate": moment(params.forecastStartDate).format(moment.HTML5_FMT.DATE),
      "forecastEndDate": moment(params.forecastEndDate).format(moment.HTML5_FMT.DATE)
    }

    if(params.forecastMethodId != '' && params.forecastMethodId != undefined)
    {
      _inputParams["method"] = params.forecastMethodId
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<models.SalesDataCollection>(environment.apiEndpoint + '/forecast', _inputParams, httpOptions)
    .toPromise();
  }
}
