import * as moment from 'moment';

export class Channel {
    channelId: string
    channel: string
    descritption: string
    products: Product[]

    constructor() {
        this.products = [];
    }
}
export class Product {
    id: string
    name: string
    brand: string
    type: number
}

export class ChannelProduct {
    id: string;
    channelId: string;
    productId: string;
}

export class ForecastMethod {
    id: string
    name: string
}

//constants
export class StaticDetail {
    channels: Channel[]
    products: Product[]
    channelProducts: ChannelProduct[]
    forecastMethods: ForecastMethod[]
    historyCutOffDate: Date
    defaultItemsToView: number
    historyYearNumbers: number[]
    forecastYearNumbers: number[];
    minimumHistoryWeeks: number;
    minimumForecastWeeks: number;

    constructor() {
        this.channels = [];
        this.products = [];
        this.channelProducts = [];
        this.forecastMethods = [];
        this.historyCutOffDate = new Date("11/30/2019");
        this.historyYearNumbers = [2014, 2015, 2016, 2017, 2018, 2019];
        this.forecastYearNumbers = [2020, 2021, 2022, 2023, 2024, 2025];
        this.defaultItemsToView = 4;
        this.minimumHistoryWeeks = 26;
        this.minimumForecastWeeks = 4;
    }

}

export class InputParams {
    historyStartDate: Date
    historyEndDate: Date
    forecastStartDate: Date
    forecastEndDate: Date
    productId: string
    channelId: string
    forecastMethodId: string
}

export class SalesDataCollection {
    historyDetails: SalesData[];
    forecast: MethodForecastMap[];
    constructor() {
        this.historyDetails = [];
        this.forecast = [];
    }
}

export class SalesData {
    salesId: string
    productId: string
    channelId: string
    date: string
    units: number
    uppers: number
    lowers: number
}

export class MethodForecastMap {
    methodId: string
    data: SalesData[];
    constructor() {
        this.data = [];
    }
}

export class MethodWeekMap {
    methodId: string
    methodName: string
    weeks: Week[]
    constructor() {
        this.weeks = [];
    }
}

export class MethodMonthMap {
    methodId: string
    methodName: string
    months: Month[]
    constructor() {
        this.months = [];
    }
}

export class MasterDisplayData {
    methodId: string
    methodName: string
    units: number[]
    constructor() {
        this.units = []
    }
}

export class ForecastHeader {
    weekNumber: number
    weekSerialNumber: number
    startDate: string
    days: string[]
    dates: string[]
    constructor() {
        this.days = [];
        this.dates = [];
    }
}

export class ForecastSummaryHeader {
    monthName: string
    year: number;
}

export class Week {
    number: number
    startDate: string
    days: string[]
    units: number
    numberOfDays: number
    serialNumber: number
    dates: string[]

    constructor() {
        this.days = [];
        this.dates = [];
        this.numberOfDays = 0;
        this.serialNumber = 0;
        this.units = 0;
    }
}

export class Year {
    year: number
    weeks: Week[]
    months: Month[]
    numberOfWeeks: number
    constructor() {
        this.weeks = [];
        this.months = [];
        for (let i = 0; i < 12; i++) {
            var _month = new Month();
            _month.number = i;
            _month.name = moment().month(i).format('MMMM');
            _month.units = 0;
            this.months.push(_month);
        }
        this.numberOfWeeks = 0;
    }
}

export class Month {
    number: number
    units: number
    name: string
    year: number
    constructor() {
        this.units = 0;
    }
}