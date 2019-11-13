import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'
import * as models from 'src/app/models/Models'
import { ForecastService } from 'src/app/services/forecast/forecast.service'
import { StaticDetailsService } from 'src/app/services/static-details/static-details.service'
import * as moment from 'moment';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import * as _ from "lodash";
//import * as CanvasJS from 'node_modules/canvasjs/dist/canvasjs.min';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule, MultiDataSet } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-sales-forecast',
  templateUrl: './sales-forecast.component.html',
  styleUrls: ['./sales-forecast.component.css']
})


export class SalesForecastComponent implements OnInit {
  chartsample: Chart;
  historyLineChartData: ChartDataSets[] = [
    { data: [], label: 'Historical Sales Numbers' },
  ];
  forecastLineChartData: ChartDataSets[] = [
    { data: [], label: 'Forecast Sales Numbers' },
  ];
  historyLineChartLabels: Label[] = [];
  forecastLineChartLabels: Label[] = [];
  lineChartOptions = {
    responsive: true,
  };
  lineChartColors: Color[] = [
    {
      borderColor: 'black'//,
      //backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  //dropdowns
  channels: models.Channel[];
  historyYears: models.Year[] = [];
  forecastYears: models.Year[] = [];
  products: models.Product[] = [];

  //constant values
  staticDetails: models.StaticDetail;

  // values selected by the user
  selectedChannel: models.Channel = null;
  selectedProduct: models.Product = null;
  selectedHistoryYear: models.Year = null;
  selectedHistoryWeek: models.Week = null;
  selectedForecastYear: models.Year = null;
  selectedForecastWeek: models.Week = null;
  selectedForecastMethod: models.ForecastMethod = null;
  historyWeekCount: number = 0;
  forecastWeekCount: number = 0;

  //switch for showing the details section
  showHistorySection: boolean;
  //object holding history and forecast data
  salesDataCollection: models.SalesDataCollection = new models.SalesDataCollection();
  //week-wise collection of history data 
  historyByWeeks: models.Week[] = [];
  //week-wise forecast data grouped by forecast method
  forecastWeeklyDataByMethod: models.MethodWeekMap[] = [];
  //month-wise forecast data grouped by forecast method
  forecastMonthlyDataByMethod: models.MethodMonthMap[] = [];

  //collection of week-wise history data to show on the screen at a time
  displayHistoryWeeks: models.Week[] = [];

  //intermediate collections of week/month-wise for processing
  //forecast data to show on the screen at a time
  displayMethodWeekMap: models.MethodWeekMap[] = [];
  displayMethodMonthMap: models.MethodMonthMap[] = [];

  //collection of method-wise units sold - for display purpose
  masterDisplayData: models.MasterDisplayData[] = [];

  //collections to pass on the table header data
  displayForecastHeaders: models.ForecastHeader[] = [];
  displayForecastSummaryHeaders: models.ForecastSummaryHeader[] = [];

  // MatPaginator event
  pageEvent: PageEvent;

  //total number of forecast weeks/months - for pagination
  totalForecastWeekCount: number;
  totalForecastMonthCount: number;

  constructor(private route: ActivatedRoute,
    private router: Router, private forecastService: ForecastService,
    private staticDetailsService: StaticDetailsService,
    private componentFactoryResolver: ComponentFactoryResolver) {
    this.staticDetails = new models.StaticDetail();

  }

  ngOnInit() {
    this.getStaticDetails();
    this.setHistoryYearsAndWeeks();
    this.setForecastYearsAndWeeks();

  }

  getStaticDetails() {
    // get channels, forecast methods from service
    // channel has products....products dropdown will dynamically load based on channel selection
    this.staticDetailsService.getChannels().then(result => {
      this.staticDetails.channels = result;
    })

    this.staticDetailsService.getChannelProducts().then(result => {
      this.staticDetails.channelProducts = result;
    })

    this.staticDetailsService.getProducts().then(result => {
      this.staticDetails.products = result;
    })

    this.staticDetailsService.getForecastMethods().then(result => {
      this.staticDetails.forecastMethods = result;
      let _newFM = new models.ForecastMethod();
      _newFM.id = ""
      _newFM.name = "--- ALL ---"
      this.staticDetails.forecastMethods.unshift(_newFM)
    })
  }

  onChange(event) {
    //dynamically load products on channel selection
    //use the channel-product mapping fetched from DB
    this.products = [];
    let _channelProducts = this.staticDetails.channelProducts.filter(a => {
      if (a.channelId == event.channelId)
        return a;

    })
    for (let i = 0; i < _channelProducts.length; i++) {
      let _product = this.staticDetails.products.filter(a => {
        if (a.id == _channelProducts[i].productId)
          this.products.push(a)
      });
    }
  }
  setHistoryYearsAndWeeks() {
    //prepare dataset for the past years with weeks to select as history start 
    for (let i = 0; i < this.staticDetails.historyYearNumbers.length; i++) {
      let _newYear = new models.Year();
      _newYear.year = this.staticDetails.historyYearNumbers[i];
      var _year = moment().year(this.staticDetails.historyYearNumbers[i]);
      var _weeksInYear = _year.isoWeeksInYear();
      var _yearStartDate = _year.startOf('year');
      for (let j = 1; j <= _weeksInYear; j++) {
        var _newWeek = new models.Week();
        _newWeek.startDate = _yearStartDate.startOf('week').format('L');
        _newWeek.number = j;
        _yearStartDate.days(7);
        _newYear.weeks.push(_newWeek);
      }
      this.historyYears.push(_newYear);
    }
  }

  setForecastYearsAndWeeks() {
    //prepare dataset for the past years with weeks to select as history start 
    for (let i = 0; i < this.staticDetails.forecastYearNumbers.length; i++) {
      let _newYear = new models.Year();
      _newYear.year = this.staticDetails.forecastYearNumbers[i];
      var _year = moment().year(this.staticDetails.forecastYearNumbers[i]);
      var _weeksInYear = _year.isoWeeksInYear();
      var _yearStartDate = _year.startOf('year');
      for (let j = 1; j <= _weeksInYear; j++) {
        var _newWeek = new models.Week();
        _newWeek.startDate = _yearStartDate.toString();
        _newWeek.number = j;
        _yearStartDate.days(7);
        _newYear.weeks.push(_newWeek);
      }
      this.forecastYears.push(_newYear);
    }
  }

  resetFormData() {
    this.selectedChannel = null;
    this.selectedProduct = null;
    this.selectedHistoryYear = null;
    this.selectedHistoryWeek = null;
    this.selectedForecastYear = null;
    this.selectedForecastWeek = null;
    this.selectedForecastMethod = null;
    this.historyWeekCount = 0;
    this.forecastWeekCount = 0;
  }

  async showHistory() {
    this.resetCollections();
    debugger;
    for (let i = 0; i < this.staticDetails.forecastMethods.length; i++) {
      var _newData = new models.MasterDisplayData();
      _newData.methodId = this.staticDetails.forecastMethods[i].id;
      _newData.methodName = this.staticDetails.forecastMethods[i].name;
      for (let j = 0; j < 8; j++) {
        _newData.units.push(null);
      }
      this.masterDisplayData.push(_newData);
    }
    //validate user inputs....show appropriate messages and prevent any invalid inputs
    if (this.validateInputs()) {
      //prepare input parameters to pass to the service
      let _inputParams = new models.InputParams();
      _inputParams.channelId = this.selectedChannel.channelId;
      _inputParams.productId = this.selectedProduct.id;
      _inputParams.historyStartDate = new Date(moment(this.selectedHistoryWeek.startDate).format());
      _inputParams.historyEndDate = new Date(moment(this.selectedHistoryWeek.startDate).add(this.historyWeekCount, 'w').format());
      _inputParams.forecastStartDate = new Date(moment(this.selectedForecastWeek.startDate).format());
      _inputParams.forecastEndDate = new Date(moment(this.selectedForecastWeek.startDate).add(this.forecastWeekCount, 'w').format());
      _inputParams.forecastMethodId = this.selectedForecastMethod.id;
      //get history and forecast data from service
      await this.forecastService.GetForecast(_inputParams).then(result => {
        this.salesDataCollection = result;
      });

      //sequentially process and present the data returned by the service
      this.processHistoryData();
      this.processForecastData();
      this.processMonthlyForecastSummary();
      this.setDisplayHistoryWeeks(0);
      this.setDisplayForecastWeeks(0);
      this.setDisplaySummaryMonths(0);
      this.showChart();
    }
  }

  showChart() {
    this.historyLineChartLabels = [];
    this.forecastLineChartLabels = [];
    this.historyLineChartData[0].data = [];
    this.forecastLineChartData[0].data = [];

    for (let i = 0; i < this.historyByWeeks.length; i++) {
      this.historyLineChartData[0].data.push(this.historyByWeeks[i].units);//black line
      this.historyLineChartLabels.push(this.historyByWeeks[i].serialNumber.toString());
    }
    debugger;
    for (let j = 0; j < this.forecastWeeklyDataByMethod[0].weeks.length; j++) {
      this.forecastLineChartData[0].data.push(this.forecastWeeklyDataByMethod[0].weeks[j].units);//blue line
      this.forecastLineChartLabels.push(this.forecastWeeklyDataByMethod[0].weeks[j].serialNumber.toString());

    }
    //this.chartsample.render();
    //this.chartsample.update();


  }
  resetCollections() {
    this.salesDataCollection = new models.SalesDataCollection();
    this.historyByWeeks = [];
    this.forecastWeeklyDataByMethod = [];
    this.forecastMonthlyDataByMethod = [];
    this.displayHistoryWeeks = [];
    this.displayMethodWeekMap = [];
    this.displayMethodMonthMap = [];
    this.masterDisplayData = [];
    this.displayForecastHeaders = [];
    this.displayForecastSummaryHeaders = [];
  }

  validateInputs(): boolean {
    if (this.selectedHistoryYear == null) {
      alert('Please select history start year.');
      return false;
    }
    if (this.selectedHistoryWeek == null) {
      alert('Please select history start week.');
      return false;
    }
    if (this.historyWeekCount < this.staticDetails.minimumHistoryWeeks) {
      alert('No. of history weeks must be greater than or equal to ' + this.staticDetails.minimumHistoryWeeks);
      return false;
    }
    if (this.selectedForecastYear == null) {
      alert('Please select forecast start year.');
      return false;
    }
    if (this.selectedForecastWeek == null) {
      alert('Please select forecast start week.');
      return false;
    }
    if (this.forecastWeekCount < this.staticDetails.minimumForecastWeeks) {
      alert('No. of forecast weeks must be greater than or equal ' + this.staticDetails.minimumForecastWeeks);
      return false;
    }
    if (this.selectedChannel == null) {
      alert('Please select a channel.');
      return false;
    }
    if (this.selectedProduct == null) {
      alert('Please select a product.');
      return false;
    }
    if (this.selectedForecastMethod == null) {
      alert('Please select a forecast method.');
      return false;
    }
    return true;
  }

  processHistoryData() {
    //show the history-forecast section on the screen
    this.showHistorySection = true;

    //group the history data by weeks
    let _groupedHistoryWeeks = _.groupBy(this.salesDataCollection.historyDetails,
      (result) => moment(result['date']).startOf('week'));

    //prepare week-wise collection for the history data  
    let _historySalesDataByWeek = _.toArray<models.SalesData[]>(_groupedHistoryWeeks);
    for (let i = 0; i < _historySalesDataByWeek.length; i++) {
      let _newWeek = new models.Week();

      if (_historySalesDataByWeek[i].length > 0) {
        _newWeek.startDate = _historySalesDataByWeek[i][0].date;
        _newWeek.number = moment(_historySalesDataByWeek[i][0].date).isoWeek();
        _newWeek.serialNumber = i + 1;
      }

      for (let j = 0; j < _historySalesDataByWeek[i].length; j++) {
        _newWeek.units += _historySalesDataByWeek[i][j].units;
        _newWeek.days.push(moment(_historySalesDataByWeek[i][j].date).format('dddd').substring(0, 1))
        _newWeek.dates.push(moment(_historySalesDataByWeek[i][j].date).format('D'))
        _newWeek.numberOfDays += 1
      }
      this.historyByWeeks.push(_newWeek);
    }
  }

  processForecastData() {
    this.totalForecastWeekCount = 0;

    for (let k = 0; k < this.salesDataCollection.forecast.length; k++) {
      let _newMethodWeekMap = new models.MethodWeekMap();
      _newMethodWeekMap.methodId = this.salesDataCollection.forecast[k].methodId;
      _newMethodWeekMap.methodName = this.staticDetails.forecastMethods.find(a =>
        a.id == _newMethodWeekMap.methodId
      ).name;

      //group the forecast data by weeks
      let _groupedForecastWeeks = _.groupBy(this.salesDataCollection.forecast[k].data,
        (result) => moment(result['date']).startOf('week'));

      //prepare week-wise collection of the forecast data
      let _forecastSalesDataByWeek = _.toArray<models.SalesData[]>(_groupedForecastWeeks);
      for (let i = 0; i < _forecastSalesDataByWeek.length; i++) {
        let _newWeek = new models.Week();

        if (_forecastSalesDataByWeek[i].length > 0) {
          _newWeek.startDate = _forecastSalesDataByWeek[i][0].date;
          _newWeek.number = moment(_forecastSalesDataByWeek[i][0].date).isoWeek();
          _newWeek.serialNumber = i + 1;

        }

        for (let j = 0; j < _forecastSalesDataByWeek[i].length; j++) {
          _newWeek.units += _forecastSalesDataByWeek[i][j].units;
          _newWeek.days.push(moment(_forecastSalesDataByWeek[i][j].date).format('dddd').substring(0, 1))
          _newWeek.dates.push(moment(_forecastSalesDataByWeek[i][j].date).format('D'))
          _newWeek.numberOfDays += 1
        }
        _newMethodWeekMap.weeks.push(_newWeek);

      }

      this.forecastWeeklyDataByMethod.push(_newMethodWeekMap);
    }
    debugger;

    if (this.forecastWeeklyDataByMethod.length > 0) {
      this.totalForecastWeekCount = this.forecastWeeklyDataByMethod[0].weeks.length;
    }
  }

  processMonthlyForecastSummary() {
    this.totalForecastMonthCount = 0;
    for (let k = 0; k < this.salesDataCollection.forecast.length; k++) {
      let _newMethodMonthMap = new models.MethodMonthMap();
      _newMethodMonthMap.methodId = this.salesDataCollection.forecast[k].methodId;
      _newMethodMonthMap.methodName = this.staticDetails.forecastMethods.find(a =>
        a.id == _newMethodMonthMap.methodId
      ).name;

      //group the forecast data by months
      let _groupedForecastMonths = _.groupBy(this.salesDataCollection.forecast[k].data,
        (result) => moment(result['date']).startOf('month'));
      //prepare month-wise collection of the forecast data to show in the summary
      let _forecastSalesDataByMonth = _.toArray<models.SalesData[]>(_groupedForecastMonths);
      for (let i = 0; i < _forecastSalesDataByMonth.length; i++) {
        let _newMonth = new models.Month();

        if (_forecastSalesDataByMonth[i].length > 0) {
          _newMonth.number = moment(_forecastSalesDataByMonth[i][0].date).month();
          _newMonth.name = moment(_forecastSalesDataByMonth[i][0].date).format('MMM');
          _newMonth.year = moment(_forecastSalesDataByMonth[i][0].date).year();
        }

        for (let j = 0; j < _forecastSalesDataByMonth[i].length; j++) {
          _newMonth.units += _forecastSalesDataByMonth[i][j].units;
        }
        _newMethodMonthMap.months.push(_newMonth);
      }

      this.forecastMonthlyDataByMethod.push(_newMethodMonthMap);
    }
    if (this.forecastMonthlyDataByMethod.length > 0) {
      this.totalForecastMonthCount = this.forecastMonthlyDataByMethod[0].months.length;
    }
  }

  historyPaginatorEvent(event) {
    this.setDisplayHistoryWeeks(event.pageIndex);
  }

  setDisplayHistoryWeeks(start: number) {
    //set weekly history data to display based on pagination selection
    this.displayHistoryWeeks = [];
    let _startWeek = start * this.staticDetails.defaultItemsToView;
    let _endWeek = _startWeek + this.staticDetails.defaultItemsToView;
    if (_endWeek > this.historyByWeeks.length)
      _endWeek = this.historyByWeeks.length;
    this.displayHistoryWeeks = this.historyByWeeks.slice(_startWeek, _endWeek);
  }

  forecastPaginatorEvent(event) {
    this.setDisplayForecastWeeks(event.pageIndex);
  }

  setDisplayForecastWeeks(start: number) {
    //set weekly forecast data to display based on pagination selection
    this.displayForecastHeaders = [];
    let _startWeek = start * this.staticDetails.defaultItemsToView;
    let _endWeek = _startWeek + this.staticDetails.defaultItemsToView;

    this.displayMethodWeekMap = [];

    for (let i = 0; i < this.forecastWeeklyDataByMethod.length; i++) {
      let _newObject = new models.MethodWeekMap();
      _newObject.methodName = this.forecastWeeklyDataByMethod[i].methodName;
      _newObject.methodId = this.forecastWeeklyDataByMethod[i].methodId;
      if (_endWeek > this.forecastWeeklyDataByMethod[i].weeks.length)
        _endWeek = this.forecastWeeklyDataByMethod[i].weeks.length;
      _newObject.weeks = this.forecastWeeklyDataByMethod[i].weeks.slice(_startWeek, _endWeek);
      this.displayMethodWeekMap.push(_newObject);
    }

    //prepare the table header data
    for (let i = 0; i < this.displayMethodWeekMap[0].weeks.length; i++) {
      let _test = new models.ForecastHeader();
      _test.startDate = this.displayMethodWeekMap[0].weeks[i].startDate;
      _test.weekNumber = this.displayMethodWeekMap[0].weeks[i].number;
      _test.weekSerialNumber = this.displayMethodWeekMap[0].weeks[i].serialNumber;
      _test.days = this.displayMethodWeekMap[0].weeks[i].days;
      _test.dates = this.displayMethodWeekMap[0].weeks[i].dates;
      this.displayForecastHeaders.push(_test);

    }
    debugger;
    //prepare the units sold data for each forecast method
    for (let i = 0; i < this.displayMethodWeekMap.length; i++) {
      for (let j = 0; j < this.displayMethodWeekMap[i].weeks.length; j++) {
        var _item = this.masterDisplayData.find(a =>
          a.methodId == this.displayMethodWeekMap[i].methodId);

        if (j == 0 && _item != undefined) {
          _item
            .units[0] = this.displayMethodWeekMap[i].weeks[j].units;
        }
        if (j == 1 && _item != undefined) {
          _item
            .units[1] = this.displayMethodWeekMap[i].weeks[j].units;
        }
        if (j == 2 && _item != undefined) {
          _item
            .units[2] = this.displayMethodWeekMap[i].weeks[j].units;
        }
        if (j == 3 && _item != undefined) {
          _item
            .units[3] = this.displayMethodWeekMap[i].weeks[j].units;
        }
      }
    }
  }

  summaryPaginatorEvent(event) {
    this.setDisplaySummaryMonths(event.pageIndex);
  }

  setDisplaySummaryMonths(start: number) {
    //set monthly forecast summary data to display based on pagination selection
    this.displayForecastSummaryHeaders = [];
    let _startMonth = start * this.staticDetails.defaultItemsToView;
    let _endMonth = _startMonth + this.staticDetails.defaultItemsToView;

    this.displayMethodMonthMap = [];

    for (let i = 0; i < this.forecastMonthlyDataByMethod.length; i++) {
      let _newObject = new models.MethodMonthMap();
      _newObject.methodName = this.forecastMonthlyDataByMethod[i].methodName;
      _newObject.methodId = this.forecastMonthlyDataByMethod[i].methodId;
      if (_endMonth > this.forecastMonthlyDataByMethod[i].months.length)
        _endMonth = this.forecastMonthlyDataByMethod[i].months.length;
      _newObject.months = this.forecastMonthlyDataByMethod[i].months.slice(_startMonth, _endMonth);
      this.displayMethodMonthMap.push(_newObject);
    }

    //prepare table header data
    for (let i = 0; i < this.displayMethodMonthMap[0].months.length; i++) {
      let _test = new models.ForecastSummaryHeader();
      _test.monthName = this.displayMethodMonthMap[0].months[i].name;
      _test.year = this.displayMethodMonthMap[0].months[i].year;
      this.displayForecastSummaryHeaders.push(_test);
    }

    //prepare units sold data by forecast method
    for (let i = 0; i < this.displayMethodMonthMap.length; i++) {
      for (let j = 0; j < this.displayMethodMonthMap[i].months.length; j++) {
        var _item = this.masterDisplayData.find(a =>
          a.methodId == this.displayMethodMonthMap[i].methodId)

        if (j == 0 && _item != undefined) {
          _item
            .units[4] = this.displayMethodMonthMap[i].months[j].units;
        }
        if (j == 1 && _item != undefined) {
          _item
            .units[5] = this.displayMethodMonthMap[i].months[j].units;
        }
        if (j == 2 && _item != undefined) {
          _item
            .units[6] = this.displayMethodMonthMap[i].months[j].units;
        }
        if (j == 3 && _item != undefined) {
          _item
            .units[7] = this.displayMethodMonthMap[i].months[j].units;
        }
      }
    }
  }
}
