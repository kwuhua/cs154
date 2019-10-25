const OUT_FILE = 'results/res.csv';
// FREQUENCIES
/*
    Why these? Mainly because according to https://www.teachmeaudio.com/mixing/techniques/audio-spectrum/ values, the audible ~flexible~ boundaries for higher and lower audible sounds by the masses are the lower hF and higher lF bounds below respectively.
*/
const highFreqs = [17500, 16000, 14500, 13000, 11500, 10000, 8500, 7000, 5500];
const lowFreqs = [10, 30, 65, 100, 135, 170, 205];
const freqs = highFreqs.concat(lowFreqs).sort(function(i, j){
    return (Math.random() * 2) - 1;
});

var whiteNoise = new Pizzicato.Sound(function(e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < e.outputBuffer.length; i++)
        output[i] = Math.random();
    }
);

async function experiment() {
  var subjectId = document.forms["begin-form"]["subjectId"].value;
  /* if (isNaN(subjectId)) {
    return false;
  } */

  // list of [freq, volume] pairs
  /*
  var tests = [];
  var i;
  for (i = 0; i < freqs.length; i++) {
    tests.push([freqs[i], 0.5])
  } */
  var tests = [[440, 0.5], [880, 0.25]] // for testing purposes

  // Hide "Begin experiment" button and show experiment buttons.
  $("#begin").css("display", "none");
  $("#expt").css("display", "block");

  // Run experiments
  var allResults = []
  for (i = 0; i < tests.length; i++) {
    /*
      when one trial is finished, results will be an object that looks like:
      {subjectId: "1", frequency: 440, volume: 0.5, response: "2"}
      The experiment function will pause now and wait for the calling of
      resolve() in doOneTrial(). The arguments of resolve() is returned by the
      awaite keyword and stored in results.
    */
    var results = await doOneTrial(subjectId, tests[i][0], tests[i][1]);
    console.log(results);
    allResults.push(results);
  }

  sendResults(subjectId, allResults)
}

function doOneTrial(subjectId, frequency, volume) {
  /*
    add event handlers to stop/play button and form submit event.
    submitting the form will call finishTrial().
    white noise is played for a certain time.
    finishTrial() then calls the callback function.
    callback then calles resolve().
  */
  return new Promise(resolve => {
    // construct sound with certain frequency and volume.
    var s = new Pizzicato.Sound({
      source: "wave",
      options: {
        type: "sawtooth",
        frequency: frequency,
        volume: volume,
      }
    });

    // this is called when an the finishTrial event handler is finished
    var callback = function (response) {
      console.log("callback");
      resolve({
        subjectId: subjectId,
        frequency: frequency,
        volume: volume,
        response: response
      });
    };

    // create trial object to pass on to other function calls
    var t = {
      subjectId: subjectId,
      frequency: frequency,
      volume: volume,
      toggleBtn: document.getElementById("expt-toggleBtn"),
      responseForm: document.getElementById("expt-response-form"),
      sound: s,
      toggleBtnEvent: function() { toggle(t) },
      responseFormEvent: function() { finishTrial(t, callback) }
    };
    console.log("played sound");

    // play sound
    s.play();

    // show response form
    document.getElementById("expt-wait").style.display = "none";
    document.getElementById("expt-response").style.display = "block";

    // add event handlers for toggling on/off and submitting response
    t.toggleBtn.addEventListener("click", t.toggleBtnEvent);
    t.responseForm.addEventListener("submit", t.responseFormEvent);
  });
}

function toggle(t) {
  // toggle sound on or off
  if (t.toggleBtn.innerHTML === "Stop") {
    console.log("stopped sound")
    t.sound.stop();
    t.toggleBtn.innerHTML = "Play";
  } else if (t.toggleBtn.innerHTML === "Play") {
    t.sound.play();
    t.toggleBtn.innerHTML = "Stop";
  }
}

function finishTrial(t, callback) {
  // finish the current trial
  console.log("Finishing trial");

  // stop sound
  t.sound.stop();
  t.toggleBtn.innerHTML = "Stop";

  // show waiting interface
  document.getElementById("expt-wait").style.display = "block";
  document.getElementById("expt-response").style.display = "none";

  // remove event handlers in this trial
  t.toggleBtn.removeEventListener("click", t.toggleBtnEvent);
  t.responseForm.removeEventListener("submit", t.responseFormEvent);

  // get response from html form
  var response = document.forms["expt-response-form"]["certain"].value;
  console.log("Response" + response);

  // play white noise
  whiteNoise.play();
  setTimeout(function() {
      whiteNoise.stop();
      setTimeout(function() {
        // callback function defined in doOneTrial
        callback(response);
      }, 2000);
  }, 5000);
}

function sendResults(subjectId, allResults) {
  var resObj = {
    subjectId: subjectId,
    results: allResults
    // list of {subjectId: "1", frequency: 440, volume: 0.5, response: "2"}
  };
  $.ajax("/", {
    data: JSON.stringify(resObj),
    contentType: "application/json",
    type: "POST",
    success: finishCallback
  });
}

function finishCallback(data) {
  console.log("finish callback");
  window.alert("Finished and sent results!");
}

$(document).ready(function(){
  $("#beginBtn").click(experiment);
})
