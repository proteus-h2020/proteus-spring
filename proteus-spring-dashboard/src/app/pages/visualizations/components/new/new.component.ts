
import { FormVisualization } from './../../form-visualization';
import { ChartService } from './../../../../chart.service';
import { RealtimeChart } from './../../../../realtime-chart';
import { Router } from '@angular/router';
// import { BatchChart } from './../../../../batch-chart';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Chart } from '../../../../chart.interface';
import 'style-loader!./new.scss';
import { Annotation } from '../../components/annotations/annotation';
import { AnnotationsService } from '../../components/annotations/annotations.service';
import { VisualizationForm } from 'app/pages/visualizations/VisualizationForm';
import { Statistics } from '../../components/statistics/statistics';
import { ComponentsService } from '../../components/components.service';
import { ComponentSet } from '../../components/componentSet';
import { AppSubscriptionsService } from './../../../../appSubscriptions.service';

import { getAvailableVisualizations, Heatmap } from 'proteic';

import { onlyUnique } from '../../../../utils/Array';

@Component({
  selector: 'create-visualization',
  templateUrl: '../visualization-form.html',
})

export class CreateVisualizationComponent extends VisualizationForm implements OnInit, OnDestroy {

  private events: any[] = [];

  constructor(
    private chartService: ChartService,
    private router: Router,
    private componentsService: ComponentsService,
    public appSubscriptionsService: AppSubscriptionsService,
  ) {
    super(appSubscriptionsService);
  }

  public save(model: RealtimeChart, isValid: boolean) {
    let self = this;
    let alarms = model.alarms;
    let coilID = model.coilID;
    let endpoints = new Array<string>();
    this.submitted = true;

    // TODO Improve: push endpoint of historical data
    if (model.calculations) {
      for (const calc of model.calculations) {
        if (calc == 'raw') {
          endpoints.push('/topic/realtime/var/' + model.variable);
        }
        if (calc == 'mean' || calc == 'variance') {
          endpoints.push('/topic/flink/var/' + model.variable);
        }
        if (calc == 'sax_vsm') {
          endpoints.push('/topic/flink/sax');
        }
      }
    }

    endpoints = endpoints.filter(onlyUnique);

    function createChart(components: ComponentSet) {
      model = new RealtimeChart(
        model.title,
        model.type,
        model.configuration,
        components,
        model.variable,
        model.calculations,
        endpoints,
      );
      model.alarms = alarms;
      model.coilID = coilID;

      self.chartService.push(model);
      if (model.coilID === 'current') {
        self.router.navigate(['pages/dashboard']);
      } else {
        self.router.navigate(['pages/historical']);
      }
    }

    if (isValid) {
      this.componentsService.getComponents()
                  .then((components) => createChart(components));
    }
  }

  public _createForm() {
    this.form = FormVisualization.createForm();
  }
}
