// Script uses some globals for simplicity of working with some common items.
// Note, the global all_texts is defined in layout.erb.
var text = "";        // The displayed text for the madlib the user chooses (to fill in the blanks).
var metadata = {};    // The metadata for the madlib the user chooses.
var newtext = "";     // Madlib text the user submits.
var user_msg = "";    // Errors, etc.
var positive_message_displayed = false; // Used to track whether "Looks good so far" is being displayed.

// Loaded on initial retrieval of page.
$(document).ready(function() {
  modal = $(".modal");
  load_collapsible_options();
});


///////////////////////////////////////////////////////////////////////////////
/////PREP////LIST//////////////////////////////////////////////////////////////
//////////////OF////MADLIBS/////TO////TRY//////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


// Used both on initial retrieval of site and when user chooses a new madlib to fill out.
function load_collapsible_options() {
  // NOTE: THE FOLLOW NEEDS TO BE PUT INTO ITS OWN FUNCTION.
  // Listeners for two page header items...
  $('.logo').click(load_collapsible_options);
  render_account_links();
  $('.start-new-madlib').click(start_new_madlib);
  // ...and "collapsible" selection of (links to) madlibs to try.
  load_madlib_options();
  $('.collapsible').collapsible(); // From Materialize.
  set_links_to_individual_madlibs();
  if (state) dispatch_state();
  toast_flashes();
}

function dispatch_state() {
  switch (state) {
    case 'signup':
      signup();
      break;
    case 'edit_madlib':
      metadata = metadata[state_data['id']];  // Assign the whole txt object to metadata.
      text = metadata['ml_text'];  // Load the text that was previously being edited.
      edit_madlib();
      break;
  }
  state = "";
}

function render_account_links() {
  $(".start-new-madlib").text("+New Mad Lib");
  if (username) {
    $(".login-logout-text").text(username);
    $('.login-logout').click(render_logout);
  } else {
    $(".signup-text").text("Sign Up");
    $(".signup").click(signup);
    $(".login-logout-text").text("Log In");
    $('.login-logout').click(render_login);
  }
}

// This can become a modal for submitting a new password as well.
function render_logout() {
  var login_form = $("<form>").attr({action: "/auth/logout", method: "get"});
  var modalContentTitle = $("<h4>").text("Going so soon?");
  var modalContent = $("<div>").addClass("modal-content");
  modalContent.append(modalContentTitle);
  var modalFooter = $("<div>").addClass("modal-footer");
  var submit = $("<input>").attr({href: "#!", type: "submit", value: "Log out"})
    .addClass("btn-flat modal-close waves-effect waves-green modal-action");
  modalFooter.append(submit);
  modalContent.append(modalFooter);
  login_form.append(modalContent);
  modal = $("#modal1");
  modal.html(login_form);
  modal.modal();
}

function render_login() {
  var login_form = $("<form>").attr({action: "/auth/login", method: "post"});
  var modalContentTitle = $("<h4>").text("Log In");
  var username_input = $("<input>").attr({
    type: "text",
    name: "user[username]"
  });
  var password_input = $("<input>").attr({
    type: "password",
    name: "user[password]"
  });
  var modalContent = $("<div>").addClass("modal-content");
  modalContent.append(modalContentTitle,
    "Username:", username_input,
    "Password:", password_input);
  var modalFooter = $("<div>").addClass("modal-footer");
  var submit = $("<input>").attr({href: "#!", type: "submit", value: "Log in"})
    .addClass("btn-flat modal-close waves-effect waves-green modal-action");
  modalFooter.append(submit);
  modalContent.append(modalFooter);
  login_form.append(modalContent);
  modal = $("#modal1");
  modal.html(login_form);
  modal.modal();
  $(document).ready(function () {
    $("#name").focus();
  });
}

function signup() {
  var signup_form = $("<form>").attr({action: "/auth/signup", method: "post"});
  var modalContentTitle = $("<h4>").text("Make an account");
  var username_input = $("<input>").attr({
    type: "text",
    name: "user[username]"
  });
  var password_input = $("<input>").attr({
    type: "password",
    name: "user[password]"
  });
  var modalContent = $("<div>").addClass("modal-content");
  modalContent.append(modalContentTitle,
    "Username (for your madlib byline):", username_input,
    "Password:", password_input);
  var modalFooter = $("<div>").addClass("modal-footer");
  var submit = $("<input>").attr({href: "#!", type: "submit", value: "Sign up"})
    .addClass("btn-flat modal-close waves-effect waves-green modal-action");
  modalFooter.append(submit);
  modalContent.append(modalFooter);
  signup_form.append(modalContent);
  modal = $("#modal2");
  modal.html(signup_form);
  modal.modal();
  var modalInstance = M.Modal.getInstance(document.querySelector("#modal2"));
  if(!modalInstance.isOpen) {
    modalInstance.open();
  }
  $(document).ready(function () {
    $("#name").focus();
  });
}

// Uses pop-up message (a "toast" from Materialize) for any flash messages.
function toast_flashes() {
  var msg = "";
  if (! $.isEmptyObject(flash)) {
    for (var key in flash) {
      if (flash.hasOwnProperty(key)) {
        msg = msg + flash[key] + " ";
      }
    }
    M.toast({html: msg});
    flash = "";
  }
}


// Prepare menu of madlibs the user can try out.
function load_madlib_options() {
  var collapse = $("<ul/>").addClass("collapsible"); // Materialize classes...
  all_texts.forEach(function(txt) {
    var item = $("<li/>");
    var div1 = $("<div/>").addClass("collapsible-header")
      .text(txt["title"]);
    var div2 = $("<div/>").addClass("collapsible-body");
    var desc = txt["description"];
    if (txt["author"]) { desc += "<br>By " + txt["author"]; }
    var id = txt["id"];
    var span = $("<span/>").addClass("" + id).html(desc);
    div2.append(span);
    item.append(div1);
    item.append(div2);
    collapse.append(item);
    $(".main").html(collapse);
  });
}

// Prepare links to individual madlibs (within collapsible menu).
function set_links_to_individual_madlibs() {
  // Iterate through all available madlib data. When there are many available, 
  // this will have to be updated to load only a few at a time.
  all_texts.forEach(function(txt) {
    var id = txt["id"];
    // Create unique identifier for this link from id; but link from the enclosing div.
    $('.' + id).parent()
      .click(function() {
        // On click, set the text and metadata to display...
        text = txt["ml_text"];  // Select the text.
        metadata = txt;  // Assign the whole txt object to metadata.
        // and then process the text to locate the blanks, and display them.
        process_text_for_blanks();
      });
  });
}


///////////////////////////////////////////////////////////////////////////////
/////PROCESS////BLANKS/////////////////////////////////////////////////////////
/////////////////////////AND///USER///ANSWERS//////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


// Prepares blanks based on text, appends them to the page with submit button, and sets up event listeners.
function process_text_for_blanks() {
  // Process text (1): compile list of blanks, incl. POS and comment; assign to ids.
  var mtext = text.replace(/\n/gm, " ");     // Get rid of newlines for massaged text.
  mtext = mtext.replace(/ {2,}/gm, " ");     // Double spaces look bad.
  var rawBlanks = mtext.match(/{.+?}/gm);    // Find the blanks in the massaged text.
  // NOTE on USER VARIABLES: madlib authors can reuse the user's answer with what I call a "user variable"; 
  // e.g., {$noun2}. The script takes one answer from the user, then automatically substitutes it in for every 
  // instance of the variable in the madlib text. 
  // Process text (2): construct new (blank) text with spans labeled with ids.
  var variables = varanswers = []; // List of user variables.
  var counter = 0;  // Gives a unique identifier for each blank in the text (user variable or not).
  var blanks = [];
  // Gather data from rawBlanks (four different kinds) to be used in printing blanks on the user's screen.
  rawBlanks.forEach(function(blank) {
    var results = [];
    // Some rawBlanks have comments (have ':').
    if (blank.match(/:/)) {
      results = blank.match(/^{(.+):(.+)}$/);
      blanks.push({
        "id": counter,                      // Helps enter user input as answer for the correct blank in the 'blanks' object.
        "pos": results[1].trim(),           // Labels parts of speech (e.g., "noun", "verb") and user variable variants on these.
        "pos_to_print": results[1].trim(),  // The POS label that the user will see on the page (no reference to user variable).
        "comment": results[2].trim(),       // Placeholder text.
        "raw": blank                        // The info input by the madlib writer; user input replaces the whole thing.
      });
    // Other rawBlanks have no comments (so don't have ':').
    } else {
      results = blank.match(/^{(.+)}$/);
      blanks.push({
        "id": counter,
        "pos": results[1],
        "pos_to_print": results[1],
        "raw": blank
      });
    }
    // If the blank contains a user variable, add it to the array 'variables' and prep the 'varanswers' object (hash).
    if (blank.includes("{$") && !variables.includes(results[1])) {
      variables.push(results[1]);
      varanswers[results[1]] = "";
    }
    counter++;
  });

  // Assemble the title, description, and text boxes (corresponding to blanks) for the user to fill in.
  var title = $("<h3/>").text(metadata["title"]);
  var description = $("<h4/>").text(metadata["description"]);
  var author = $("<p/>").text("From the fecund brain of " + metadata["author"]);
  var edit_link = "";
  var delete_link = "";
  if (username === metadata["author"]) {
    edit_link = $("<a/>").html("Edit")
      .attr({href: "#"}).append("&nbsp;&nbsp;").click(edit_madlib);
    delete_link = $("<a/>").html("Delete<br/><br/>")
      .attr({href: "#"}).click(function() {
        if (confirm("Sure you want to delete this?")) {
          $.post("/delete", {id: metadata["id"]}, function() {
            M.toast({html: "Your madlib was deleted!"});
            location.reload();
          })
            .fail(function() { M.toast({html: "There was a problem with the server. Not deleted."}) });
        }
      });
  }
  var header = $("<div/>").addClass("header");
  header.append(author, title, description, edit_link, delete_link);
  // Construct blanks by going through ids (could go thru blanks, skipping dupes).
  var answers = $("<div/>").addClass("answers");
  blanks.forEach(function(blank) {
    var print_me = true;
    // Only the first instance of a user variable is shown to the user.
    if (blank["pos"].includes('$')) {
      if (variables.includes(blank["pos"])) {
        delete variables[variables.indexOf(blank["pos"])];
        blank["pos_to_print"] = blank["pos"].replace(/^\$(.+)\d+$/, "$1");
      } else {
        print_me = false;
      }
    }
    // Note, print_me is true for all blanks that don't contain user variables; so they're all printed.
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
  $("#submit").click({"blanks": blanks}, process_answers)
    .click({"header": header, "blanks": blanks}, display_text_with_replacements);
  $("#0").focus();
}

// Grabs user's input answers.
// Attaches user's input answer to each blank in easy-to-process "blanks" object.
// Most of the logic here is necessary to handle user-supplied variables.
function process_answers(d) {
  var blanks = d.data.blanks;
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
}

// Last step: display the text using the user's supplied words.
function display_text_with_replacements(d) {
  var header = d.data.header;
  var blanks = d.data.blanks;
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


///////////////////////////////////////////////////////////////////////////////
/////START///NEW///////////////////////////////////////////////////////////////
/////////////////////////MADLIB///AUTHORED///BY///USER/////////////////////////
///////////////////////////////////////////////////////////////////////////////


// Allows a user to write the text of a whole new madlib.
function start_new_madlib() {
  // Prep user message (for validation feedback) and wrapper.
  $(".user-msg").remove();
  user_msg = $("<div/>").addClass("user-msg").html(user_msg);
  var div = $("<div/>").addClass("textarea-wrapper").append(user_msg);
  user_msg = "";
  // Create title and description fields.
  var title = $("<input/>").attr({type: "text", id: "title", placeholder: "Up to 30 characters"});
  var description = $("<input/>").attr({type: "text", id: "description", placeholder: "30-60 characters"});
  div.append("Title: ").append(title);
  div.append("Description: ").append(description);
  // Create a textarea with some instructions to the user and a submit button.
  var examples = "Example blanks: {noun}, {adverb:ending in -ly}, {$name1}, {$name1:will be repeated throughout this madlib}"
  var textarea = $("<textarea/>").addClass("new-ml-textarea")
    .addClass("materialize-textarea").css({height: "300px", maxWidth: "800px"})
    .attr({placeholder: examples, id: "ml_text"}).val(newtext);
  div.append("Enter your madlib text:<br>")
     .append(textarea);
  // Construct the form with check and save buttons.
  var validate_button = $("<input/>").attr({type: "button"})
    .addClass("validate-button waves-effect waves-light btn blue")
    .val("Check My Mad Lib!");
  var save_button = $("<button/>")
    .addClass("save-button waves-effect waves-light btn green")
    .text("Save for all to use!");
  var form_for_save = $("<form/>").append(validate_button).append(save_button);
  var main = $(".main").html(div);
  title.focus();
  // Listen for keypresses; check each one to see if you need to remove a positive message.
  $(".new-ml-textarea").keypress(function() {
    if (positive_message_displayed) {
      user_msg = "";
      report_user_msg();
      positive_message_displayed = false;
    }
  });
  main.append(form_for_save);
  // Set the button event listeners; saves the result.
  $(".validate-button").click(validate_madlib);
  form_for_save.submit(function(e) {
    e.preventDefault();
    if (validate_madlib()) {
      $.post("/save", construct_new_madlib(), function() {
        console.log("looks successful");
       })
        // If successfully saved, reload the page so the user can see the link.
        .done(function() {
          M.toast({html: "Your madlib should be at the top of the list!"});
          location.reload();
        })
        .fail(function() { M.toast({html: "There was a problem with the server. Not saved."}) });
    }
  });
}

function edit_madlib() {
  // Prep user message (for validation feedback) and wrapper.
  $(".user-msg").remove();
  user_msg = $("<div/>").addClass("user-msg").html(user_msg);
  var div = $("<div/>").addClass("textarea-wrapper").append(user_msg);
  user_msg = "";
  // Create "edit" label and title and description fields.
  var edit_area_title = $("<h4>").html("Edit your madlib!");
  div.append(edit_area_title);
  var title = $("<input/>").attr({type: "text", id: "title", placeholder: "Up to 30 characters"}).val(metadata["title"]);
  var description = $("<input/>").attr({type: "text", id: "description", placeholder: "30-60 characters"}).val(metadata["description"]);
  div.append("Title: ").append(title);
  div.append("Description: ").append(description);
  // Create a textarea with some instructions to the user and a submit button.
  var examples = "Example blanks: {noun}, {adverb:ending in -ly}, {$name1}, {$name1:will be repeated throughout this madlib}"
  var textarea = $("<textarea/>").addClass("new-ml-textarea")
    .addClass("materialize-textarea").css({height: "300px", maxWidth: "800px"})
    .attr({placeholder: examples, id: "ml_text"}).val(metadata["ml_text"]);
  div.append("Your madlib text:<br>")
    .append(textarea);
  // Construct the form with check and save buttons.
  var validate_button = $("<input/>").attr({type: "button"})
    .addClass("validate-button waves-effect waves-light btn blue")
    .val("Check My Mad Lib!");
  var save_button = $("<button/>")
    .addClass("save-button waves-effect waves-light btn green")
    .text("Save changes!");
  var form_for_edit = $("<form/>").append(validate_button).append(save_button);
  var main = $(".main").html(div);
  title.focus();
  // Listen for keypresses; check each one to see if you need to remove a positive message.
  $(".new-ml-textarea").keypress(function() {
    if (positive_message_displayed) {
      user_msg = "";
      report_user_msg();
      positive_message_displayed = false;
    }
  });
  main.append(form_for_edit);
  // Set the button event listeners; saves the result.
  $(".validate-button").click(validate_madlib);
  form_for_edit.submit(function(e) {
    e.preventDefault();
    if (validate_madlib()) {
      $.post("/save_edit", construct_edited_madlib(), function() {
        console.log("looks successful");
      })
        .done(function() {
          M.toast({html: "Your madlib, '" + metadata['title'] + "', was saved!"});
        })
        .fail(function() {
          M.toast({html: "There was a problem with the server. Edits not saved. (Please save offline.)"})
        });
    }
  });
}

// Validate the new mad lib!
function validate_madlib() {
  console.log("I'm in yer function, validatin yer text!");
  // Validate title.
  var title = $("#title");
  if (! title.val()) {
    user_msg = "Add a title, please.";
    report_user_msg();
    return;
  }
  if (title.val().length > 25) {
    user_msg = "Your title is " + $("#title").val().length + " characters long. Maximum is 25.";
    report_user_msg();
    return;
  }
  // Validate description.
  var description = $("#description");
  if (! description.val()) {
    user_msg = "Add a description, please.";
    report_user_msg();
    return;
  }
  dl = description.val().length;
  if (dl < 25 || dl > 60) {
    user_msg = "Your description is " + dl + " characters long. It should be between 25 and 60.";
    report_user_msg();
    return;
  }
  // Grab new madlib text.
  newtext = $(".new-ml-textarea").val();
  // ML should exist.
  if (! newtext.trim()) {
    user_msg = "Please enter a new madlib. ";
    report_user_msg();
    return;
  }
  // ML should have at least one sentence's worth...we'll say 10 words.
  var split_newtext = newtext.split(/ /mg);
  if (split_newtext.length < 10) {
    user_msg = "Not enough words (10 minimum). ";
    report_user_msg();
    return;
  }
  // ML should have at least one {}.
  if (! /\{.+?\}/.test(newtext) ) {
    user_msg = "There should be at least one blank, e.g., something like this: {noun}";
    report_user_msg();
    return;
  }
  // Every { should be followed by a } on the same line.
  var unmatched_curlies = newtext.match(/\{[^\}]+?$/g);
  // Every { should be followed by a } before seeing another { (on the same line).
  if (! unmatched_curlies) { unmatched_curlies = newtext.match(/\{[^\}]+?\{/g);}
  if (unmatched_curlies) {
    user_msg = "Every { must be closed with a }. This bit isn't closed:<br>&nbsp;&nbsp;&nbsp;<code>" + unmatched_curlies[0] + "</code>";
    report_user_msg();
    return;
  }
  // Every { should be followed by } within 80 characters (on the same line).
  var bad = false;
  var curlies = newtext.match(/\{(.+?)\}/g);
  curlies.forEach(function(curly) {
    if (curly.length > 81) {
      user_msg = "This item is too long (" + curly.length + " characters; max. 80 allowed):<br>&nbsp;&nbsp;&nbsp;<code>" + curly + "</code>";
      report_user_msg();
      bad = true;
    }
  });
  if (bad) { return }
  // After stripping $ and number, as well as : and whatever follows that, each POS should be found on a canonical list.
  var poses = curlies.map(function(curly) {
    return curly.replace(/\{(.+?)\}/, "$1")   // Strip brackets.
                .replace(/^\$(.+)$/, "$1")    // Strip leading dollar sign.
                .replace(/(.+?)\:.+/, "$1")   // Strip colon and contents following it.
                .replace(/(.+?)\d+/, "$1");   // Strip numbers from end of user variables.
  });
  var good_poses = "noun name number pronoun verb adjective adverb preposition conjunction interjection".split(/ /);
  poses.forEach(function(pos) {
    if (! good_poses.includes(pos)) {
      user_msg = "Begin each blank with a part of speech. Your '" + pos + "' isn't on the list:<br>&nbsp;&nbsp;&nbsp;" +
        good_poses.join(", ");
      report_user_msg();
      bad = true;
    }
  });
  if (bad) { return }
  // There are exactly four acceptable forms: {pos}, {pos:foo}, {$pos1}, and {$pos1:foo}.
  curlies.forEach(function(curly) {
    curly = curly.replace(/\{(.+?)\}/, "$1");
    if (good_poses.includes(curly)) { return }
    var test1 = curly.match(/(.+?)\:(.+)/);
    if (test1) {
      var test2 = test1[1].match(/^\$(\w+?)\d+$/);
      if (good_poses.includes(test1[1])) { return }
      else if (test2 && good_poses.includes(test2[1])) { return }
    }
    var test3 = curly.match(/\$(.+?)\d+$/);
    if (test3 && good_poses.includes(test3[1])) { return }
    user_msg = "Your {" + curly + "} is not well-formed. These four examples are acceptable:" +
               "<br><code>&nbsp;&nbsp;&nbsp;{noun} {noun:a dessert} {$adjective1} {$verb1:plural, past, transitive}</code>";
    report_user_msg();
    bad = true;
  });
  if (bad) { return }
  // The text shouldn't be too damn long.
  if (newtext.length > 6500) {
    user_msg = "Wow, that's " + newtext.length + " characters long. That's over our upper limit of 6500 characters.";
    report_user_msg();
    return;
  }

  // If you've got this far, it must look good.
  user_msg = "Looks good so far.";
  positive_message_displayed = true;
  report_user_msg();
  return true; // For when saving.
}

// Append and then clear the user message (used during validation).
function report_user_msg() {
  $(".user-msg").html("").append(user_msg);
  user_msg = "";
}

// Prepares user's madlib data for posting (after validating).
function construct_new_madlib() {
  return { 
    "ml_text": newtext,
    "title": $("#title").val(),
    "description": $("#description").val(),
    "author": (username || "Anonymous")
  }
}

function construct_edited_madlib() {
  // Assigning to the global 'metadata' updates the edit fields on reload.
  metadata = {
    "id": metadata['id'],
    "ml_text": newtext,
    "title": $("#title").val(),
    "description": $("#description").val(),
    "author": (username || "Anonymous")
  };
  // Since a madlib has been edited, resave all_texts. Might be better if this
  // was just reloaded from the database after saving, but this is faster.
  all_texts = all_texts.map( function(txt) {
    if (txt['id'] === metadata['id']) {
      return metadata;
    } else {
      return txt;
    }
  });
  return metadata;
}