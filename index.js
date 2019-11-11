// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const request = require('request');
const numeral = require('numeral');

const skillName = 'Street Wizard';

function getAllEntitledProducts(inSkillProductList) {
    const entitledProductList = inSkillProductList.filter(record => record.entitled === 'ENTITLED');
    return entitledProductList;
}
function getAllPurchasableProducts(inSkillProductList) {
    const entitledProductList = inSkillProductList.filter(record => record.purchasable === 'PURCHASABLE');
    return entitledProductList;
}

/*
    Helper function that returns a speakable list of product names from a list of
    entitled products.
*/

const msgDirection = 'Ask Street Wizard a yes or no question.' ;
const msgDefault = 'Ask Street Wizard a yes or no question and you will get 1 of 3 different answers.';
const msgUnlocked = 'Ask Street Wizard a yes or no question and you will get 1 of 10 different answers.';
const msgUpsell = ' to unlock more answers, say, what can I buy?';
const msgProduct = 'You can unlock 10 different answers instead of having 3 possible answers by saying, Buy More Answers '
const msgStop = ' or to stop, say, stop';
const msgPrompt = ' What would you like to do?';

/*
function getTopCoinsText(hasAddOn) {

    return new Promise(((resolve, reject) => {

    console.log(`~~~~ about to call api`);
    var urlToCall = 'https://api.coinmarketcap.com/v1/ticker/?start=0&limit=' + (hasAddOn == true ? '5' : '3');

    request.get(
        urlToCall,
        {},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                console.log(`~~~~ successful payload`);
                var resJson = JSON.parse(body);
                var coinNames = '', commas = '';
                
                //price_usd
                var summary = '';
                //#1coin
                summary += 'The number one ranked coin is ' + resJson[0].name + '. In the last twenty four hours, it has ' + (resJson[0].percent_change_24h > 0 ? 'increased' : 'decreased');
                summary += ' in value. The current value is ' + numeral(resJson[0].price_usd).format('$0,0[.]00') + '. ';
                console.log(`~~~~ summary 1 ` + summary);
                //#2coin
                summary += 'Ranked at number two is ' + resJson[1].name + '. In the last twenty four hours, it has ' + (resJson[1].percent_change_24h > 0 ? 'increased' : 'decreased');
                summary += ' in value. The current value is ' + numeral(resJson[1].price_usd).format('$0,0[.]00') + '. ';
                console.log(`~~~~ summary 2` + summary);

                //#3coin
                summary += (hasAddOn == true ? 'Ranked' : 'Finally') + ' at number three, we have ' + resJson[2].name + '. In the last twenty four hours, it has ' + (resJson[2].percent_change_24h > 0 ? 'increased' : 'decreased');
                summary += ' in value. The current value is ' + numeral(resJson[2].price_usd).format('$0,0[.]00') + '. ';
                console.log(`~~~~ summary 3` + summary);
                if (hasAddOn == true) {
                    console.log(`~~~~ summary has addon`);
                    summary += 'Ranked at number four, we have ' + resJson[3].name + '. In the last twenty four hours, it has ' + (resJson[3].percent_change_24h > 0 ? 'increased' : 'decreased');
                    summary += ' in value. The current value is ' + numeral(resJson[3].price_usd).format('$0,0[.]00') + '. ';
                    console.log(`~~~~ summary 4`);
                    summary += 'Finally at number five, we have ' + resJson[4].name + '. In the last twenty four hours, it has ' + (resJson[4].percent_change_24h > 0 ? 'increased' : 'decreased');
                    summary += ' in value. The current value is ' + numeral(resJson[4].price_usd).format('$0,0[.]00') + '. ';

                }


                resolve(summary);

            } else {
                console.log(`~~~~ error`);
                reject('Error');
            }
        }
    );

    }))

}
*/
const LaunchRequestISPHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response';
    },


    handle(handlerInput) {
        
        if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ALREADY_PURCHASED') {
            const speakOutputProduct = msgDefault + msgPrompt;//' Just say, summarize.';
            return handlerInput.responseBuilder
                .speak(speakOutputProduct)
                .reprompt(speakOutputProduct)
                .getResponse();
        }
        else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
            const speakOutputProduct = msgDefault + msgPrompt;//' Just say, summarize.';
            return handlerInput.responseBuilder
                .speak(speakOutputProduct)
                .reprompt(speakOutputProduct)
                .getResponse();

        }
        else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'DECLINED') {
            const speakOutputProduct = msgDefault + msgPrompt;//' You can still get a summary of the top 3 coins. Just say, summarize';
            return handlerInput.responseBuilder
                .speak(speakOutputProduct)
                .reprompt(speakOutputProduct)
                .getResponse();

        }
    }
}
const LaunchRequestHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },


    async handle(handlerInput) {
        
        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        const voicePurchaseSetting = await ms.getVoicePurchaseSetting();

        try{
            const productResult = await ms.getInSkillProducts(locale);
        
            const entitledProducts = getAllEntitledProducts(productResult.inSkillProducts);
            const purchasableProducts = getAllPurchasableProducts(productResult.inSkillProducts);
            if (entitledProducts && entitledProducts.length > 0) {
                // Customer owns one or more products
                
                const speakOutputProduct = `Welcome to ${skillName}. You currently own the More Answers add-on so you will get 1 of 10 possible answers. ` +
                msgDirection + msgPrompt;//' Just say, summarize.';
                return handlerInput.responseBuilder
                    .speak(speakOutputProduct)
                    .reprompt(speakOutputProduct)
                    .getResponse();
            }
            console.log(`~~~~ launch re - o products`);
            
            console.log('No entitledProducts');
            var speakOutputNoProduct = `Welcome to ${skillName}. ` + msgDefault ;//Top Coins will summarize the top three Coins based on Market Cap. Just say, summarize.`;
            if (voicePurchaseSetting && purchasableProducts.length > 0)
            {
                speakOutputNoProduct += msgUpsell;//` To hear how you can purchase the ability to hear a summary of the top five coins, 
    //say, What can I buy.`;
            }
            speakOutputNoProduct += msgStop + msgPrompt;

            return handlerInput.responseBuilder
                .speak(speakOutputNoProduct)
                .reprompt(speakOutputNoProduct)
                .getResponse();
        //},
        }
        catch (err){
            //function reportPurchasedProductsError(err) {
                console.log(`Error calling InSkillProducts API: ${err}`);

                return handlerInput.responseBuilder
                    .speak('Something went wrong in loading your purchase history')
                    .getResponse();
            }
        
        
    }
};
const startIntentHandler = {
    
    canHandle(handlerInput) {   
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'startIntent';
    },
    async handle(handlerInput) {
        
        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();


        try{
            var result = await ms.getInSkillProducts(locale);
        
            const entitledProducts = getAllEntitledProducts(result.inSkillProducts);
            const purchasableProducts = getAllPurchasableProducts(result.inSkillProducts);
            
            var responseToUse = RESPONSES;
            
            if (entitledProducts && entitledProducts.length > 0) {
                responseToUse = RESPONSES_MORE;
            } 
            var responseIndex = Math.floor(Math.random() * responseToUse.length);
            var randomResponse = responseToUse[responseIndex];
        
            //var speakOutputProduct = await getTopCoinsText(entitledProducts && entitledProducts.length > 0);
            var speakOutputProduct = randomResponse;

            speakOutputProduct += ' Ask another question. ' + msgStop;//To hear this summary again, Just say, summarize. To stop, say, stop.';
                    
                    
                    if (entitledProducts && entitledProducts.length > 0) {
                        // Customer owns one or more products

                        return handlerInput.responseBuilder
                            .speak(speakOutputProduct)
                            .reprompt(speakOutputProduct)
                            .getResponse();
                    }

                    // Not entitled to anything yet.
                    console.log('Regular Game');
                    
            if (purchasableProducts && purchasableProducts.length > 0) {
                speakOutputProduct +=  msgUpsell;// or you can say, What can I buy.'
            }
                    return handlerInput.responseBuilder
                        .speak(speakOutputProduct)
                        .reprompt(speakOutputProduct)
                        .getResponse();                                            
                }
                catch (err){
                
                    console.log(`Error calling InSkillProducts API: ${err}`);

                    return handlerInput.responseBuilder
                        .speak('Something went wrong in loading your purchase history')
                        .getResponse();
            
                }


    }
};


const WhatCanIBuyIntentHandler = {
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatCanIBuyIntent');
    },
   async handle(handlerInput) {

        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        

        const voicePurchaseSetting = await ms.getVoicePurchaseSetting();
        return ms.getInSkillProducts(locale).then(
            function reportPurchasedProducts(result) {

                
                if (!voicePurchaseSetting) {
                    const cannotBuy = 'Sorry, In-Skill Purchasing is disabled. ' + msgDefault + msgStop;// To hear a summary of the top 3 coins, just say, summarize. To stop, say, stop.';

                    return handlerInput.responseBuilder
                        .speak(cannotBuy)
                        .reprompt(cannotBuy)
                        .getResponse();
                }

                const entitledProducts = getAllEntitledProducts(result.inSkillProducts);
                if (entitledProducts && entitledProducts.length > 0) {
                    // Customer owns one or more products

                    const speakOutputProduct = 'You already own the More Answers add-on. ' + msgDirection + msgStop;

                    return handlerInput.responseBuilder
                        .speak(speakOutputProduct)
                        .reprompt(speakOutputProduct)
                        .getResponse();
                }

                // Not entitled to anything yet.
                console.log('pitch');
                const speakOutputNoProduct = msgProduct;//'You can hear a summary of the top five coins based on market cap by saying, Buy Top Five Coins. To hear a summary of only the top 3, just say, summarize. To stop, say, stop.';
                
                return handlerInput.responseBuilder
                    .speak(speakOutputNoProduct)
                    .reprompt(speakOutputNoProduct)
                    .getResponse();
            },
            function reportPurchasedProductsError(err) {
                console.log(`Error calling InSkillProducts API: ${err}`);

                return handlerInput.responseBuilder
                    .speak('Something went wrong in loading your purchase history')
                    .getResponse();
            },
        );

    }
};
const BuyLongerGameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuyIntent');
    },
    handle(handlerInput) {
        //const speakOutput = 'You can purchase the Longer Game by saying, Buy Longer Game.';
        return handlerInput.responseBuilder
            .addDirective({
                type: "Connections.SendRequest",
                name: "Buy",
                payload: {
                    InSkillProduct: {
                        productId: "amzn1.adg.product.cbe11ea4-2ed8-4ca2-8023-df659d44cc1c",
                    }
                },
                token: "correlationToken"
            })
            .getResponse();

    }
};




const CancelTopFiveIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'RefundProductIntent');
    },
    handle(handlerInput) {
        //const speakOutput = 'You can purchase the Longer Game by saying, Buy Longer Game.';
        return handlerInput.responseBuilder
            .addDirective({
                type: "Connections.SendRequest",
                name: "Cancel",
                payload: {
                    InSkillProduct: {
                        productId: "amzn1.adg.product.cbe11ea4-2ed8-4ca2-8023-df659d44cc1c",
                    }
                },
                token: "correlationToken"
            })
            .getResponse();

    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const voicePurchaseSetting = await ms.getVoicePurchaseSetting();

        var speakOutput = msgDirection;// 'You can hear a summary of the top 3 coins by market cap, just say, summarize.';

        if (voicePurchaseSetting) {
            speakOutput += msgUpsell;//' or you can say, What can I buy.';
        }
        speakOutput += msgPrompt;//' What would you like to do? ';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Be Easy, Peace!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ err`);
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        startIntentHandler,
        WhatCanIBuyIntentHandler,
        BuyLongerGameIntentHandler,
        LaunchRequestISPHandler,
        HelpIntentHandler,
        CancelTopFiveIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

/*****
 * 
 * OLD
 */
