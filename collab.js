// Collaborative Drawing
// Gokce Taskan
// To be used with p5.js

Collab = {
  id: "",
  firebase: null,
  database: null,
  calls: [],
  monitor: true,
  load: function() {
    // First connection
    $.getScript('https://www.gstatic.com/firebasejs/live/3.0/firebase.js', function() {
      var config = {
        apiKey: "AIzaSyBUUwlBWmtmaOByg3RQQrz1YR7TEEhXfX0",
        authDomain: "art-of-code-collab1.firebaseapp.com",
        databaseURL: "https://art-of-code-collab-1.firebaseio.com/",
        storageBucket: "art-of-code-collab1.appspot.com",
      };
      window.Collab.firebase = firebase;
      firebase.initializeApp(config);
      window.Collab.database = firebase.database();
    });
  },
  setup: function(id) {
    // Set namespace
  	this.id = id;
    this.monitor = false;
  },
  sendClear: function() {
    // Clear remote and calls array
    this.calls = [];
    this.database.ref('collaborators/' + this.id).remove();
  },
  sendCall: function(calls) {
    // Send all calls to remote
    if (this.id == "") {
      print("=== Error ===");
      print("You did not run specify name for yourself");
      print("In order to initialize your connection run Collab.setup(\"Your Name\");");
      print("=============");
      print("Switching to monitor mode");
      this.monitor = true;
      return;
    }
    this.database.ref('collaborators/' + this.id).set({
      calls: calls
    });
  },
  clear: function() {
    background(0);
    this.sendClear();
  },
  call: function() {
    // Register call to calls array
    let allowedCalls = ["background", "ellipse", "rect", "line", "stroke", "noStroke", "fill", "rectMode", "text", "textSize"];
    let args = Array.prototype.slice.call(arguments);
    let name = args[0];
    let values = args.slice(1);
    if (values.length == 0) { values = [""]; }

    if (allowedCalls.includes(name)) {
      window[name].apply(this, values);
      var obj = {};
      obj[name] = values;
      this.calls.push(obj);
    }
  },
  draw: function() {
    if (this.monitor) {
      this.fetch();
    } else {
      this.sendCall(this.calls);
    }
  },
  fetch: function() {
    // Fetch all the calls from remote
    this.database.ref('/collaborators/').once('value').then(function(snapshot) {

      // Clear the screen
      background(0);

      // Stop if no collaborator call is available
      if (snapshot.val() === null) { return; }
      var ids = Object.keys(snapshot.val());

      // Iterate through each collaborator
      for (var k=0; k<ids.length; k++) {
        var id = ids[k];
        var calls = snapshot.val()[id].calls;
        // Skip if calls is empty
        if (calls === null) { continue; }
        this.zindex = snapshot.val()[id].zindex;
        noStroke();
        fill(255, 80);
        text(id, 4, this.zindex*20+20);

        // Iterate through each call
        for (var i=0; i<calls.length; i++) {
          var call = calls[i];
          //if (call === undefined) { continue; }
          var name = Object.keys(call)[0];
          var values = call[name];
          // Handle empty call (function call without any parameters)
          if (values.length == 1 && values[0] == "") { values = null }
          window[name].apply(this, values);
        }
      }
    });
  }
}
Collab.load();
