import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Chart } from '../../../chart.interface';


@Component({
  selector: 'ba-card-proteic',
  templateUrl: './baCardProteic.html',
})
export class BaCardProteic {
  @Input() chart: Chart;
  @Input() baCardClass: String;
  @Input() cardType: String;
  @Output('removeChart') removeChartEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output('editChart') editChartEventEmitter: EventEmitter<any> = new EventEmitter<any>();


  remove() {
    this.removeChartEventEmitter.emit(this.chart);
  }

  edit() {
    this.editChartEventEmitter.emit(this.chart);
  }
}
