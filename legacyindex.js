'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = ''; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var SKILL_NAME = 'Street Wizard';

/**
 * Array containing space facts.
 */
var RESPONSES = [
    "No Doubt.",
    "Oh, without a doubt.",
    "For Sure.",
    "Hell Yeah Son.",
    "Nah, Nope.",
    "yiss ir",
    "But of course my Gee.",
    "Sorry my dude.",
    "It ain't looking good."    
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetWelcome');
    },
    'GetNewIntent': function () {
        this.emit('GetResponse');
    },
    'GetWelcome': function () {
        // Get a random space fact from the space facts list
        //var responseIndex = Math.floor(Math.random() * RESPONSES.length);
        //var randomResponse = RESPONSES[responseIndex];
        var welcomeResponse = "Ask Street Wizard a yes or no question and I will answer it, or you can say exit. Ask me a yes or no question.";
        // Create speech output
        var reprompt = "Ask a yes or no question.";
        var speechOutput = welcomeResponse;

        this.emit(':ask', speechOutput, reprompt);
        //this.emit(':tellWithCard', speechOutput, SKILL_NAME, welcomeResponse);
    },
    'GetResponse': function () {
        // Get a random space fact from the space facts list
        var responseIndex = Math.floor(Math.random() * RESPONSES.length);
        var randomResponse = RESPONSES[responseIndex];

        // Create speech output
        var speechOutput = randomResponse;

        this.emit(':tellWithCard', speechOutput, SKILL_NAME, randomResponse);
    },
    'AMAZON.HelpIntent': function () {
        //var speechOutput = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
        var speechOutput = "Ask Street Wizard a yes or no question and I will answer it, or you can say exit. Ask me a yes or no question.";
        var reprompt = "Ask a yes or no question.";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Peace!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Be Easy, Peace!');
    }
};