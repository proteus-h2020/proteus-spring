import { Subscription } from 'rxjs/Rx';

import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { NotificationsService } from './../../../notifications.service';
import { WebsocketService } from './../../../websocket.service';
import { AppSubscriptionsService } from './../../../appSubscriptions.service';
import { RealtimeChart } from './../../../realtime-chart';


import {
  Chart,
  Barchart,
  Gauge,
  Heatmap,
  Linechart,
  Scatterplot,
  StackedArea,
  Streamgraph,
  Sunburst,
  Swimlane,
  Colors
} from 'proteic';

@Component({
  selector: 'proteic',
  styleUrls: ['./proteic.scss'],
  templateUrl: './proteic.html',
})
export class Proteic implements OnInit, AfterViewInit, OnDestroy {

  private id: string;
  private element: any;
  private subscriptions: Subscription[] = new Array<Subscription>();

  private lastCoilReceived: number = -1;

  @Input() private chart: RealtimeChart;

  private proteicChart: Chart;

  constructor(
    private websocketService: WebsocketService,
    private notificationService: NotificationsService,
    private appSubscriptionsService: AppSubscriptionsService,
  ) { }

  ngOnInit() {
    this.id = 'proteic' + Date.now().toString();
    this._setChartConfiguration();
  }

  ngAfterViewInit(): void {

    this._subscribeToCoilChange();

    const unpivot = this._calculateUnpivotArray(this.chart);

    const alertCallback: Function = (data: any) => {
      this.notificationService.push(
        { id: data.varId,
          label: 'Alarm',
          text: 'Value out of range: ' + data.value + ' units in x= ' + data.x + ' for variable : ' + data.key,
        },
      );
    };

    const annotations = this.chart.components.annotations;
    const statistics = this.chart.components.statistics;

    switch (this.chart.type) {
      case 'Barchart':
        this.proteicChart = new Barchart([], this.chart.configuration).unpivot(unpivot);
        break;
      case 'Gauge':
        this.proteicChart = new Gauge([], this.chart.configuration).unpivot(unpivot);
        break;
      case 'Heatmap':
        this.proteicChart = new Heatmap([], this.chart.configuration);
        break;
      case 'Linechart':
        if (this.chart.alarms) {
          this.proteicChart = new Linechart([], this.chart.configuration)
            .annotations(annotations)
            .statistics(statistics)
            .unpivot(unpivot)
            .alert(this.chart.variable, (value, events) => {
              return value < events.get('mean') - events.get('stdDeviation') ||
                value > events.get('mean') + events.get('stdDeviation');
            }, alertCallback, {
              click: (data: any) => window.alert(
                'Variable = ' + data.key  + ', value = ' + data.value + ', position(x) = ' + data.x,
              ),
            });
        } else {
            this.proteicChart = new Linechart([], this.chart.configuration)
              .annotations(annotations)
              .statistics(statistics)
              .unpivot(unpivot);
        }
        break;
      case 'Network':
        break;
      case 'Scatterplot':
        this.proteicChart = new Scatterplot([], this.chart.configuration).unpivot(unpivot);
        break;
      case 'StackedArea':
        this.proteicChart = new StackedArea([], this.chart.configuration).unpivot(unpivot);
        break;
      case 'Streamgraph':
        break;
      case 'Sunburst':
        break;
      case 'Swimlane':
        this.proteicChart = new Swimlane([], this.chart.configuration);
        break;
      default:
        break;
    }

    if (this.chart.coilID === 'current') {
      for (const websocketEndpoint of this.chart.endpoints) {
        const subs = this.websocketService.subscribe(websocketEndpoint);
        const subscription = subs.subscribe((data: any) => {
          const json = JSON.parse(data);
          if (typeof json.type !== 'undefined') { // Check if it is a real-time value. If so, add a key.
            json.key = '' + json.varId;
          }
          if (typeof json.mean !== 'undefined') {
            // TODO: add alarm factor
          }
          if (json.coilId !== this.lastCoilReceived && this.lastCoilReceived !== -1) {
            this.proteicChart.clear();
            this.notificationService.clear();
            this.proteicChart.keepDrawing(json);
          } else {
            this.proteicChart.keepDrawing(json);
          }

          this.lastCoilReceived = json.coilId;
        });
        this.subscriptions.push(subscription);
      }
    } else { // hisorical
      const coilID: number = +this.chart.coilID,
        varID: number = +this.chart.variable;
      // TODO Improve: add for loop by endpoints (realtime by coil and var, moments by coil -> need to explore it more)
      this.appSubscriptionsService.requestHistoricalData(coilID, varID);
      const historicalDataSubscription = this.appSubscriptionsService.historicalData().subscribe((data: any) => {
        const json = data.value;
        if (json) {
          json.key = '' + json.varId;
          this.proteicChart.keepDrawing(json);
        }
      });
      this.subscriptions.push(historicalDataSubscription);
    }

  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
    this.proteicChart.erase();
  }

  /**
   * It assigns some chart configurations that user can't set
   * @private
   * @memberof Proteic
   */
  private _setChartConfiguration() {
    switch (this.chart.type) {
      case 'Heatmap':
      case 'Swimlane':
        this.chart.configuration.marginRight = 160;
        this.chart.configuration.marginLeft = 40;
        break;

      default:
        this.chart.configuration.marginRight = 100;
        break;
    }
    this.chart.configuration.marginBottom = 50;
    // this.chart.configuration.marginLeft = 70;
    this.chart.configuration.marginTop = 35;
    this.chart.configuration.selector = '#' + this.id;
    this.chart.configuration.nullValues = ['NULL', 'NUL', '\\N', NaN, null, 'NaN'];
    this.chart.configuration.legendPosition = 'top';
    this.chart.configuration.pauseButtonPosition = 'right';
  }

  private _calculateUnpivotArray(chart: RealtimeChart): string[] {
    const unpivot = new Array<string>();
    for (const calculation of this.chart.calculations) {
      if (calculation !== 'raw') {
        unpivot.push(calculation);
      }
    }
    return unpivot;
  }

  private _subscribeToCoilChange() {
    /*
    const coilSubscription = this.appSubscriptionService.coilChange().subscribe(
      (data: any) => {
        this.notificationService.clear();
      },
    );
    this.subscriptions.push(coilSubscription);
    */
  }
}
