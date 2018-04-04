# Madlibs.js
This is just a version of Mad Libs written mostly in JavaScript, with a 
Ruby/Sinatra backend. 

## Install
Clone the repo into a new directory. Make sure Ruby is installed (v. 2.4.0), 
then run `bundle install`. You might need to install some gems by hand but I 
don't think so. If you have trouble installing, email me at
yo.larrysanger@gmail.com.

## Run
To run the server, which is Sinatra (not Rails), simply navigate to the
app's top-level directory and execute `ruby app.rb`. Then view the page 
(it's a single-page app) in a browser at `http://localhost:4567`.

## Adding new mad libs
You need to do two things to add a new mad lib: add some metadata in JSON
format to madlibs.json, and the "file" field must replicate the name you save
it under in texts/. In texts/, you create a new file (follow the format "ml" + 
the next number in the series + .txt) for your mad lib text with blanks.

Surround blanks with { and }. While this isn't validated yet, it will be. I'll
probably limit the available mad lib blanks to noun, name, number, adjective,
adverb, verb, and maybe a few others. After a colon you can put a (not too long)
description of what sort of word you want the user to write. To reuse words as
variables, precede the part of speech with $ and follow it with a number, as in 
$noun1. Wherever you want that word (supplied by the user) to appear later in
the mad lib, simply put {$noun1}.

Example:
> `{$name1:child's name}'s favorite subject is {noun:school subject} while
{$name2:child's name}'s is {noun:another school subject}. The trouble is that
the kids {verb:plural present intransitive} whenever they study together. But
this makes Mama very {adjective:describes a person}, which isn't always a
good thing.`

> `{$name1} and {$name2} are good students, but they are bad {$noun1:plural, 
role/job}. As {$noun1} they are very {adjective:bad in kid way}. But since Mama
{verb:third person present transitive} {$name1} and {$name2}, maybe it's OK.`

While it requires some grammatical acumen, you really do sort of have to specify
such things as grammatical person (first, second, third person), number 
(singular or plural), transitive or intransitive of verbs, etc. Otherwise your
user will write something nonsensical.

## Future plans
Later versions might save new datafiles. I'd like to see an "add mad lib" button
that opens a text area the user can fill up with text, validates as following
my (simple) mad lib markup, and saves. I'd also like to let users save their
mad lib data, which other users could load after viewing their own versions.
Then if you could vote for your favorite versions, that would be icing on the
cake.

## Programming notes
All the logic is in JavaScript/jquery, located at public/js/main.js. The only 
thing the server does is deliver the datafiles. Almost all of the HTML is 
created on the fly by jquery. The CSS/JS library is Materialize, which my 
11-year-old son introduced me to.

The code is messy and definitely could use some refactoring.