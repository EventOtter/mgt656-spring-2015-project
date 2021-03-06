'use strict';

var events = require('../models/events');
var validator = require('validator');

// useless comments

// Date data that would be useful to you
// completing the project These data are not
// used a first.
//
var allowedDateInfo = {
  months: {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  },
  minutes: [0, 30],
  hours: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ]
};

/**
 * Controller that renders a list of events in HTML.
 */
function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events.all,
    'time': currentTime
  };
  response.render('event.html', contextData);
}

/**
 * Controller that renders a page for creating new events.
 */
function newEvent(request, response){
  var contextData = {};
  response.render('create-event.html', contextData);
}

/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
function saveEvent(request, response){
  var contextData = {errors: []};

 
  if (validator.isLength(request.body.title, 5, 50) === false) {
    contextData.errors.push('Your title should be between 5 and 100 letters.');
  }
  if (validator.isLength(request.body.location, 5, 50) === false) {
      contextData.errors.push('Your location should be less than 50 charactars.');
  }
   if (validator.isURL(request.body.image) === false) {
    contextData.errors.push('Your image should be an URL');
  }
  var img_length = request.body.image.length;
  if (img_length < 4 || (request.body.image.substr(img_length - 4, 4) != ".gif" &&
      request.body.image.substr(img_length - 4, 4) != ".png")) {
    contextData.errors.push('Your image should be a gif or png');
  }
  if (validator.isNumeric(request.body.year) === false) {
      contextData.errors.push('Your year must be an integer');
  }
   if (validator.isIn(request.body.year, [2015, 2016]) === false) {
      contextData.errors.push('Your year must be 2015 or 2016');
  }
    if (validator.isNumeric(request.body.month) === false) {
      contextData.errors.push('Your month must be an integer');
  }
   if (validator.isIn(request.body.month, [0,1,2,3,4,5,6,7,8,9,10,11]) === false) {
      contextData.errors.push('Your month must be between 1 to 12');
  }
  if (validator.isNumeric(request.body.day) === false) {
      contextData.errors.push('Your day must be an integer');
  }
  if (validator.isIn(request.body.day,[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]) === false) {
      contextData.errors.push('Your day must be between 1 to 31');
  }
    if (validator.isNumeric(request.body.hour) === false) {
      contextData.errors.push('Your hour must be an integer');
  }
  if (validator.isIn(request.body.hour,[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]) === false) {
      contextData.errors.push('Your hour must be between 0 to 23');
  }
   if (validator.isNumeric(request.body.minute, 0, 30) === false) {
      contextData.errors.push('Your minute must be o or 30');
  }
  
  
  if (contextData.errors.length === 0) {
    var new_id = 0;
    while (true) {
      var found = false;
      for (var event in events) {
        if (new_id == event.id) {
          found = true;
          break;
        }
      }
      if (!found) {
        break;
      } else {
        new_id++;
      }
    }
    var newEvent = {
      id: new_id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
      date: new Date(),
      attending: []
    };
    events.all.push(newEvent);
    response.redirect('/events/' + new_id);
  }else{
    response.render('create-event.html', contextData);
  }
}

function eventDetail (request, response) {
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  } else {
    response.render('event-detail.html', {event: ev, title: ev.title, tagline: ''});
  }
}

function rsvp (request, response){
  var ev = events.getById(parseInt(request.params.id));
  
if (ev === null) 
  {
    response.status(404).send('No such event');
  }
  else if(validator.isEmail(request.body.email) && request.body.email.toLowerCase().indexOf('yale.edu')>-1)
  {
    ev.attending.push(request.body.email);
    response.redirect('/events/' + ev.id);
  }
  else
  {
    console.log('NOT added');
    var contextData = {errors: [], event: ev};
    contextData.errors.push('Invalid email');
    response.render('event-detail.html', contextData);    
  }
}

function api(request,response){
  var url = require('url');
  var keyword = url.parse(request.url, true).query.search;
  var output = null;
  if (keyword) {
    var keywords = keyword.toLowerCase().split(' ');
    console.log(keywords);
    output = {events:[]};
    for (var i=0; i < events.all.length; i++) {
      var keyword_is_not_matching = false;
      var title = events.all[i].title.toLowerCase();
      for (var j = 0; j < keywords.length; ++j) {
        if (title.indexOf(keywords[j]) < 0) {
          keyword_is_not_matching = true;
          break;
        }
      }
      if (!keyword_is_not_matching) {
        output.events.push(events.all[i]);
      }
    }
  } else {
    output = {events:events.all};
  }
  response.json(output);
}


/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'listEvents': listEvents,
  'eventDetail': eventDetail,
  'newEvent': newEvent,
  'saveEvent': saveEvent,
  'rsvp': rsvp,
  'api': api
};