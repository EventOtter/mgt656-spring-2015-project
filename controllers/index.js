'use strict';

var events = require('../models/events');

/**
 * Controller that renders our index (home) page.
 */
function index (request, response) {
  var contextData = {
    'title': 'EventOtter',
    'tagline': 'You will never feel bored here.',
    'events': events.all,
    'now': new Date(),
  };
  response.render('index.html', contextData);
}

module.exports = {
  index: index
};
