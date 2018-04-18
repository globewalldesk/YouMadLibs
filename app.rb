require 'sinatra'
require 'sinatra/base'
require 'sinatra/activerecord'
require 'sinatra/flash'
require './config/environment'
require 'bundler'
Bundler.require
require 'rubygems'
require 'bcrypt'
require './models/user'
require './lib/warden' # Includes warden (authentication) routes.
enable :sessions

####
## NEXT STEP: do config in database.yml; then test that system operates with ActiveRecord!
####

class Madlib < ActiveRecord::Base
end

class MadLibsApp < Sinatra::Base
  use Rack::Session::Pool
  register Sinatra::Flash
  set :root, File.dirname(__FILE__)
end

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