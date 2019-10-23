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
  if (isNaN(subjectId)) {
    return false;
  }

  // list of [freq, volume] pairs
  /*
  var tests = [];
  var i;
  for (i = 0; i < freqs.length; i++) {
    tests.push([freqs[i], 0.5])
  }
  */
  var tests = [[440, 0.5], [880, 0.25]];
  // Hide "Begin experiment" button and show experiment buttons.
  document.getElementById("begin").style.display = "none";
  document.getElementById("expt").style.display = "block";

  // Run experiments
  for (i = 0; i < tests.length; i++) {
    var results = await doOneTrial(subjectId, tests[i][0], tests[i][1]);
    console.log(results);
  }

  window.alert("finished!");
}

function doOneTrial(subjectId, frequency, volume) {
  return new Promise(resolve => {
    var s = new Pizzicato.Sound({
      source: "wave",
      options: {
        type: "sawtooth",
        frequency: frequency,
        volume: volume,
      }
    });

    var callback = function (response) {
      console.log("callback")
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
    }
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


function trial(subjectId, tests) {
  // get first item in tests, and remove it from list
  var values = tests.shift();

  var s = new Pizzicato.Sound({
    source: "wave",
    options: {
      type: "sawtooth",
      frequency: values[0],
      volume: values[1],
    }
  });

  // create trial object to pass on to other function calls
  var t = {
    subjectId: subjectId,
    frequency: values[0],
    volume: values[1],
    toggleBtn: document.getElementById("expt-toggleBtn"),
    responseForm: document.getElementById("expt-response-form"),
    sound: s,
    toggleBtnEvent: function() { toggle(t) },
    responseFormEvent: function() { finishTrial(t, tests) }
  }
  console.log("played sound");

  // play sound
  s.play();

  // show response form
  document.getElementById("expt-wait").style.display = "none";
  document.getElementById("expt-response").style.display = "block";

  // add event handlers for toggling on/off and submitting response
  t.toggleBtn.addEventListener("click", t.toggleBtnEvent);
  t.responseForm.addEventListener("submit", t.responseFormEvent);
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

function recordResults(subjectId, frequency, volume, response) {
  /*
  fs.appendFile(OUT_FILE,
    subjectId + ',' + frequency + ',' + volume + ',' + response + '\n',
    function (err) {
      if (err) throw err;
    }
  );
  */
}
