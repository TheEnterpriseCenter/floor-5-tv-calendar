import React from 'react';
import axios from 'axios';

export default class GetEvents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: []
    };
  }

  queryEvents() {
    axios.get(this.props.SpacesCalURL)
      .then(res => {
        const events = res.data.items.map(function(event) {
          let AMPM, endHours, startHours, endAMPM, startAMPM;
          let startTime = new Date(event.start.dateTime);
          let endTime = new Date(event.end.dateTime);
          let time = new Date();

          function pad(n) {
            return (n < 10) ? ("0" + n) : n;
          }

          function twentyfourtotwelve(hours) {
            if ( hours > 11 ){
              AMPM = "PM";
            } else {
              AMPM = "AM";
            }
            hours = hours === 12 ? 12 : hours % 12
            return [hours, AMPM];
          }

          [startHours, startAMPM] = twentyfourtotwelve(startTime.getHours());
          [endHours, endAMPM] = twentyfourtotwelve(endTime.getHours());

          if(startAMPM === endAMPM) {
            event.start.time = `${startHours}:${pad(startTime.getMinutes())}`;
            event.end.time = `${endHours}:${pad(endTime.getMinutes())} ${endAMPM}`;
          } else {
            event.start.time = `${startHours}:${pad(startTime.getMinutes())} ${startAMPM}`;
            event.end.time = `${endHours}:${pad(endTime.getMinutes())} ${endAMPM}`;
          }

          if (endTime.getTime() < time.getTime()) {
            event.class = "past";
          } else {
            event.class = "current";
          }
          return event;
      }).filter( event => {
        if(event.hasOwnProperty("visibility") && event.visibility === "private") {
          return false;
        } else {
          return true;
        }
      });
        this.setState({ events });
      });
    }

  componentDidMount() {
    this.queryEvents();
    window.setInterval(function () {
      this.queryEvents();
    }.bind(this), 5 * 60 * 1000);
  }

  render() {
    if (this.state.events.length === 0) {
      return (
        <div className="past">
          <p className="event-title">No Scheduled Events Today</p>
        </div>
      )
    } else {
      return (
        <div>
          {this.state.events.map(event =>
            <div key={event.id} className={event.class}>
              <p className="event-title">{event.summary}</p>
              <p className="event-time">{event.start.time} - {event.end.time}</p>
            </div>
          )}
        </div>
      )
    }
  }
}
