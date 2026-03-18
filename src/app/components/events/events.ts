import { Component } from '@angular/core';
import { Calendar } from '../calendar/calendar';
import { Map } from "../map/map";
import { Charts } from "../charts/charts";

@Component({
  selector: 'app-events',
  imports: [Calendar, Map, Charts],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {

}
