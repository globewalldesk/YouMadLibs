# YouMadLibs
This is just a version of Mad Libs written mostly in JavaScript, with a 
Ruby/Sinatra backend. Other programming notes below.

## View running app
Go to [youmadlibs.herokuapp.com](https://youmadlibs.herokuapp.com) if I still
have it running there.

## Install locally
Clone the repo into a new directory. Make sure Ruby is installed (v. 2.4.0),
as well as bundler (`gem install bundler`). Run `bundle install`. You might 
need to install some gems by hand but I don't think so. I think the only files 
you might need to edit in order to get it running locally are `environment.rb`
and `database.yml`. In addition, you'll want to execute `rake db:migrate`.
(Precede commands by `bundle exec` if necessary.)

## Run locally
To run the server locally, which is Sinatra (not Rails), simply navigate to 
the app's top-level directory and execute `ruby app.rb`. Then view the page 
(it's a single-page app) in a browser at `http://localhost:4567`.

## Install and run on Heroku
Set up the repo on your local Linux environment first, make sure it's been made
into a git repo (`git init` etc.) which is updated with your changes. You'll
also need to install the Heroku CLI app. Then create the Heroku app (see 
heroku.com for instructions on that) and push it using `git push heroku 
master` (assuming your version is on the master branch). Make sure you've got 
a Heroku postgres add-on for the app. You'll need to get the `postgres://...` 
address for your database, and then set the environment variable (a good way is
with `heroku config:set DATABASE_URL=` followed by that database URL) for 
`DATABASE_URL` if you use my `database.yml`; if you fiddle with that, you
might need other environment variables. Once the database is going, you'll 
need to migrate the database on Heroku using `heroku run rake db:migrate` and
then maybe `heroku restart` if it's not running.
 
If you have trouble installing, email me at yo.larrysanger@gmail.com.

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

## Programming notes
Libraries/gems include jQuery for JS, Materialize for CSS, Warden for user 
authentication, and ActiveRecord for an ORM. Databases are Sqlite3 for 
development and Postgres for production. Everything is written with deployment 
on Heroku in mind. See Sources below for relevant notes on making this work.

Most the logic is in JavaScript/jquery, located at public/js/main.js. The only 
thing the server does is deliver the data, save new madlibs submitted by 
users, and handle user authentication. Almost all of the HTML is created on 
the fly by jQuery. This is a new programming style for me and sometimes it 
might seem a little inefficient, but I find it extremely clarifying and much
simpler, in the long run, than loads of complex HTML and CSS. The CSS library 
is Materialize, which my 11-year-old son introduced me to.

The JS uses quite a few functions that don't, strictly speaking, need to be
functions. It does this just for neatness (and future reusability). Rather than
keeping track of arguments and making the functions self-contained, I've used
several global variables--some, like `all_texts` (which is declared in 
`views/layout.erb`), `text`, `metadata`, and `user_msg` (declared atop 
`public/js/main.js`), being quite important).

The directory structure is sort of MVC, but without controllers. The `/text` 
directory is simply a collection of texts you can use to input. These need to
be put in a correctly-formatted `db/seeds.rb` file. The Sinatra routes can be
found in `routes/routes.rb` but also in `lib/warden.rb` for the authentication
routes.

The models are kept to a minimum since so much work (such as validation) is
done by client-side JS.

### Sources

The very first version of the site was in plain Sinatra and simply used JSON
files for storage. But Heroku doesn't allow scripts to directly change text
files. You *have* to use a database if you want the user to be able to save
anything.

So, in order to use Sinatra with Postgres and Active Record on Heroku, I 
initially followed a good
[tutorial by David McCoy](https://medium.com/@dmccoy/deploying-a-simple-sinatra-app-with-postgres-to-heroku-c4a883d3f19e)
that allowed me to post a version without user accounts. But then of course to
allow editing, I needed to add user accounts.

I decided to use Warden for authentication, but unfortunately there was little
documentation of how to get Warden to work with Sinatra. I started with a short
but helpful [tutorial by Erik Chacon](https://coderwall.com/p/ellbgw/sinatra-authentication-with-warden).
That didn't get me far enough. To fill in the gaps, [this tutorial by
Steve Klise](https://sklise.com/2013/03/08/sinatra-warden-auth/) was very
helpful, but being from 2013, it was quite old and used DataMapper for an ORM. 
At that point I had basic user accouts, but I was using DataMapper and Sqlite3 
for the User class and ActiveRecord and Postgres for the Madlib class!

I decided to get rid of DataMapper, but to do that, I had to edit a lot of the
Warden set-up. To do that, I ended up following [this Sinatra "skeleton" by 
Simon Neutert](https://github.com/simonneutert/sinatras-skeleton/blob/master/routes/user_routes.rb)
(itself based on the tutorials by Chacon and Klise).

That's where I am right now (as of April 18, 2018).

### Future plans

It's still not possible to create new accounts, but it shouldn't be a huge
stretch to add them. Once the user account stuff is in place, I want to make
it possible to do several things:

* Associate madlibs with accounts; allow users to view just their own madlibs.
* Show numbers of views and of fill-outs of each madlib.
* Save the fill-outs (if the user so chooses).
* Rate madlibs and allow sorting based on rating.
* Rate fill-outs and allow sorting based on that.