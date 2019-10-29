const OUT_FILE = 'results/res.csv';
// FREQUENCIES
/*
    Why these? Mainly because according to https://www.teachmeaudio.com/mixing/techniques/audio-spectrum/ values, the audible ~flexible~ boundaries for higher and lower audible sounds by the masses are the lower hF and higher lF bounds below respectively.
*/
const highFreqs = [22000, 20500, 19000, 17500, 16000, 14500, 13000, 11500, 10000, 8500];
const lowFreqs = [10, 15, 20, 25, 30, 35, 40, 55, 70, 85];
const freqs =　[17500, 16000, 35, 8500, 85, 11500, 20, 55, 25, 14500, 10, 10000, 20500, 22000, 19000, 40, 70, 13000, 15, 30];

/*
highFreqs.concat(lowFreqs).sort(function(i, j){
    return (Math.random() * 2) - 1;
});
*/


const SET_VOLUME = 1.0;
const REF_DUR = 3000;
const REF_TEST_PAUSE_DUR = 2000;
const TEST_SOUND_DUR = 5000;
const TEST_REF_PAUSE_DUR = 1000;

var whiteNoise = new Pizzicato.Sound(function(e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < e.outputBuffer.length; i++)
        output[i] = Math.random();
    }
);

var refSound = new Pizzicato.Sound({
  source: "wave",
  options: {
    type: "sine",
    frequency: 440,
    volume: SET_VOLUME
  }
});

async function experiment() {
  var subjectId = document.forms["begin-form"]["subjectId"].value;

  // list of frequencies
  var tests = freqs; // use this for complete test
  // var tests = [440, 880] // for testing purposes

  // Hide "Begin experiment" button and show experiment buttons.
  $("#begin").css("display", "none");
  $("#expt").css("display", "block");

  // Run experiments
  var allResults = []
  for (i = 0; i < tests.length; i++) {
    /*
      when one trial is finished, results will be an object.
      The experiment function will pause now and wait for the calling of
      resolve() in doOneTrial(). The arguments of resolve() is returned by the
      awaite keyword and stored in results.
    */
    var final = (i == tests.length - 1);
    var results = await doOneTrial(subjectId, tests[i], final);
    console.log(results);
    allResults.push(results);
  }

  sendResults(subjectId, allResults);
}

function waitFor(time) {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve();
    }, time);
  });
}

function doOneTrial(subjectId, frequency, final) {
  /*
    add event handlers to stop/play button and form submit event.
    submitting the form will call finishTrial().
    white noise is played for a certain time.
    finishTrial() then calls the callback function.
    callback then calles resolve().
  */
  return new Promise(async function(resolve) {
    var testSound = new Pizzicato.Sound({
      source: "wave",
      options: {
        type: "sine",
        frequency: frequency,
        volume: SET_VOLUME,
      }
    });

    // This function will be called at the end
    var callback = function (response) {
      console.log("callback");
      resolve({
        frequency: frequency,
        response: response
      });
    };

    // create trial object to pass on to other function calls
    var t = {
      subjectId: subjectId,
      frequency: frequency,
      responseForm: document.getElementById("expt-response-form"),
      sound: testSound,
      toggleBtnEvent: function() { toggle(t) },
      responseFormEvent: function() { finishTrial(t, final, callback) }
    };

    // add event handlers for toggling on/off and submitting response
    t.responseForm.addEventListener("submit", t.responseFormEvent);

    // show expt-ref div.
    $("#expt-ref").css("display", "block");
    $("#expt-response").css("display", "none");
    $("#expt-wait").css("display", "none");
    $("#expt-finish").css("display", "none");

    // play reference sound
    refSound.play();
    await waitFor(REF_DUR);
    refSound.stop();

    // wait for a few seconds before hearing actual tested sound
    await waitFor(REF_TEST_PAUSE_DUR);

    // show expt-response div.
    $("#expt-ref").css("display", "none");
    $("#expt-response").css("display", "block");
    $("#expt-response-submit").css("display", "none");

    // play sound
    testSound.play();
    await waitFor(TEST_SOUND_DUR);
    testSound.stop();

    // The user can only see the submit button after the sound has finished playing
    $("#expt-response-submit").css("display", "block");
  });
}

async function finishTrial(t, isFinal, callback) {
  // finish the current trial
  console.log("Finishing trial");
  // remove event handlers in this trial
  t.responseForm.removeEventListener("submit", t.responseFormEvent);

  // show waiting interface
  $("#expt-response").css("display", "none");
  if (isFinal) {
    $("#expt-finish").css("display", "block");
  } else {
    $("#expt-wait").css("display", "block");
  }

  // get response from html form
  var response = document.forms["expt-response-form"]["intensity"].value;
  console.log("Response" + response);

  if (!isFinal) {
    await waitFor(TEST_REF_PAUSE_DUR);
  }

  callback(response);
}

function sendResults(subjectId, allResults) {
  var resObj = {
    subjectId: subjectId,
    results: allResults
  };
  $.ajax("/", {
    data: JSON.stringify(resObj),
    contentType: "application/json",
    type: "POST",
    success: finishCallback
  });
}

function finishCallback(data, textstatus, blahblah) {
  console.log("finish callback");
}

$(document).ready(function(){
  $("#beginBtn").click(experiment);
})
