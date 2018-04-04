var whichtext = ''; // The madlib text to display.
var metadata = {};  // The madlib metadata for display.
var blanks = [];    // The madlib blanks to show to the user.
var header = $("<div/>").addClass("header");    // The header for this madlib.

$(document).ready(function() {
  load_collapsible_options();
});

function load_collapsible_options() {
  $('.logo').click(load_collapsible_options);
  load_madlib_options();
  $('.collapsible').collapsible();
  set_links_to_individual_madlibs();
}

// Prepare madlib options on page load or restart.
function load_madlib_options() {
  var collapse = $("<ul/>").addClass("collapsible");
  all_metadata.forEach(function(datum) {
    var item = $("<li/>");
    var div1 = $("<div/>").addClass("collapsible-header")
      .text(datum["title"]);
    var div2 = $("<div/>").addClass("collapsible-body");
    var desc = datum["description"];
    if (datum["author"]) { desc += "<br>By " + datum["author"]; }
    var fileID = datum["file"].replace(".txt", "");
    var span = $("<span/>").addClass(fileID).html(desc);
    div2.append(span);
    item.append(div1);
    item.append(div2);
    collapse.append(item);
    $(".main").html(collapse);
  });
}

// Prepare links to individual madlibs.
function set_links_to_individual_madlibs() {
  all_metadata.forEach(function(datum) {
    var fileID = datum["file"].replace(".txt", "");
    $(document).ready(function() {
      $('.' + fileID).click(function() {
          set_text(datum["file"]);
        })
        .click(process_text_for_blanks)
    });
  })
}

// Need to find out which metadata object is associated with this text.
function load_whichtext_metadata(whichtext) {
  var rDatum = {};
  all_metadata.forEach(function(datum) {
    if (datum["file"] === whichtext) { rDatum = datum; }
  });
  return rDatum;
}

function set_text(whichtext) {
  // 'whichtext' is just the name of the text.
  text = texts[whichtext];
  metadata = load_whichtext_metadata(whichtext);
  console.log(metadata);
}

// Prepares blanks based on text.
function process_text_for_blanks() {
  // Process text (1): compile list of blanks, incl. POS and comment; assign to ids.
  var mtext = text.replace(/\n/gm, " ");     // Get rid of newlines for massaged text.
  mtext = mtext.replace(/ {2,}/gm, " ");     // Double spaces look bad.
  var rawBlanks = mtext.match(/{.+?}/gm);      // Find the blanks.
  // Replace these with user answers.
  // Process text (2): construct new (blank) text with spans labeled with ids.
  var variables = varanswers = []; // List of user-supplied variables.
  var counter = 0;
  blanks = [];
  rawBlanks.forEach(function (blank) {
    var results = [];
    if (blank.match(/:/)) {
      results = blank.match(/^{(.+):(.+)}$/);
      blanks.push({
        "id": counter,
        "pos": results[1],
        "pos_to_print": results[1],
        "comment": results[2],
        "raw": blank
      });
    } else {
      results = blank.match(/^{(.+)}$/);
      blanks.push({
        "id": counter,
        "pos": results[1],
        "pos_to_print": results[1],
        "raw": blank
      });
    }
    if (blank.includes("{$") && !variables.includes(results[1])) {
      variables.push(results[1]);
      varanswers[results[1]] = "";
    }
    counter++;
  });

  // Construct enclosing div contents.
  var title = $("<h3/>").text(metadata["title"]);
  var description = $("<h4/>").text(metadata["description"]);
  header.html("");
  header.append(title).append(description);
  // Construct blanks by going through ids (could go thru blanks, skipping dupes).
  var answers = $("<div/>").addClass("answers");
  blanks.forEach(function(blank) {
    var print_me = true;
    if (blank["pos"].includes('$')) {
      if (variables.includes(blank["pos"])) {
        delete variables[variables.indexOf(blank["pos"])];
        blank["pos_to_print"] = blank["pos"].replace(/^\$(.+)\d+$/, "$1");
      } else {
        print_me = false;
      }
    }
    if (print_me) {
      var input = $('<input/>').attr({type: 'text', id: blank["id"],
        placeholder: blank["comment"]});
      var div = $('<div/>').append(blank.pos_to_print[0].toUpperCase() +
        blank.pos_to_print.slice(1) + ": ").append(input);
      answers.append(div);
    }
  });
  // Submitting the blanks should be handled 100% (for now) by JavaScript.
  var submit = $('<a/>').addClass("waves-effect waves-light btn green")
    .attr({id: 'submit'}).html("Submit");
  answers.append(submit);
  $(".main").html(header).append(answers);
  $("#submit").click(process_answers).click(display_text_with_replacements);
}

function process_answers() {
  blanks.forEach(function(blank) {
    blank["answer"] = $("#" + blank["id"]).val();
    // Record answer for this variable (if it's a user variable).
    if (blank["pos"].includes("$") && ! varanswers[blank["pos"]]) {
      varanswers[blank["pos"]] = blank["answer"];
    }
    // If answer is undefined because it's a user variable, use recorded answer.
    if (! blank["answer"] && blank["pos"].includes("$")) {
      blank["answer"] = varanswers[blank["pos"]];
    }
  });
  return blanks;
}

// Last step: display the text using the user's supplied words.
function display_text_with_replacements() {
  // Strategy: iterate over blanks array; search for raw; replace with answer.
  blanks.forEach(function(blank) {
    text = text.replace(blank["raw"], "<u>" + blank["answer"] + "</u>");
  });
  text = text.replace(/^([^<p>])/, "<p>$1");
  text = text.replace(/\n\n/g, "</p><p>");
  text = text.replace(/([^</p>])$/, "$1</p>");
  var main = $(".main");
  main.html(header).append(text);
  var restartButton = $("<button/>")
    .addClass("restart-button waves-effect waves-light btn green")
    .text("Try another?");
  main.append(restartButton);
  $('.restart-button').click(load_collapsible_options);
}

