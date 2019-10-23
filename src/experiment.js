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

function experiment() {
  var subjectId = document.forms["begin-form"]["subjectId"].value;
  if (isNaN(subjectId)) {
    return false;
  }

  // list of [freq, volume] pairs
  var tests = [];
  var i;
  for (i = 0; i < freqs.length; i++) {
    tests.push([freqs[i], 0.5])
  }
  // Hide "Begin experiment" button and show experiment buttons.
  document.getElementById("begin").style.display = "none";
  document.getElementById("expt").style.display = "block";

  // Run experiments
  trial(subjectId, tests);
}


function trial(subjectId, tests) {
  var values = tests.shift();
  var s = new Pizzicato.Sound({
    source: "wave",
    options: {
      type: "sawtooth",
      frequency: values[0],
      volume: values[1],
    }
  });
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
  s.play();
  document.getElementById("expt-wait").style.display = "none";
  document.getElementById("expt-response").style.display = "block";
  t.toggleBtn.addEventListener("click", t.toggleBtnEvent);
  t.responseForm.addEventListener("submit", t.responseFormEvent);
}

function toggle(t) {
  if (t.toggleBtn.innerHTML === "Stop") {
    console.log("stopped sound")
    t.sound.stop();
    t.toggleBtn.innerHTML = "Play";
  } else if (t.toggleBtn.innerHTML === "Play") {
    t.sound.play();
    t.toggleBtn.innerHTML = "Stop";
  }
}

function finishTrial(t, tests) {
  console.log("Finishing trial");
  t.sound.stop();
  t.toggleBtn.innerHTML = "Stop";

  document.getElementById("expt-wait").style.display = "block";
  document.getElementById("expt-response").style.display = "none";
  t.toggleBtn.removeEventListener("click", t.toggleBtnEvent);
  t.responseForm.removeEventListener("submit", t.responseFormEvent);

  var response = document.forms["expt-response-form"]["certain"].value;
  console.log("Response" + response);
  recordResults(t.subjectId, t.frequency, t.volume, response)

  whiteNoise.play();
  setTimeout(function(){
      whiteNoise.stop();
      setTimeout(function(){
        trial(t.subjectId, tests);
      }, 2000);
  }, 5000);
  // wait for a few seconds to go to next trial
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
