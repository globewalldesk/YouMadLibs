require 'sinatra'
require 'sinatra/activerecord'
require 'json'
enable :sessions

set :database, {adapter: "sqlite3", database: "db/madlibs.sqlite3"}

class Madlib < ActiveRecord::Base
end

helpers do
  def title
    if @title
      "#{@title}"
    else
      "Welcome."
    end
  end
end

class App < Sinatra::Base
  get('/') do
    @ml_texts = Madlib.order("created_at DESC")
    @title = "Welcome."
    erb :"index"
  end

  post('/save') do
    puts params.inspect
    new_madlib_data = {title: params['title'], author: params['author'], description: params['description'], ml_text: params['ml_text']}
    new_madlib = Madlib.new(new_madlib_data)
    new_madlib.save
    redirect '/'
  end
end