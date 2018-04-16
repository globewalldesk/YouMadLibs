require 'sinatra'
require 'sinatra/activerecord'
require 'sinatra/base'
require './config/environment'
require 'bundler'
Bundler.require
require './model'
enable :sessions

class Madlib < ActiveRecord::Base
end

class SinatraWardenExample < Sinatra::Base
  register Sinatra::Flash
end

use Warden::Manager do |config|
  # Tell Warden how to save our User info into a session.
  # Sessions can only take strings, not Ruby code, we'll store
  # the User's `id`
  config.serialize_into_session{|user| user.id }
  # Now tell Warden how to take what we've stored in the session
  # and get a User from that information.
  config.serialize_from_session{|id| User.get(id) }

  config.scope_defaults :default,
                        # "strategies" is an array of named methods with which to
                        # attempt authentication. We have to define this later.
                        strategies: [:password],
                        # The action is a route to send the user to when
                        # warden.authenticate! returns a false answer. We'll show
                        # this route below.
                        action: 'auth/unauthenticated'
  # When a user tries to log in and cannot, this specifies the
  # app to send the user to.
  config.failure_app = self
end

Warden::Manager.before_failure do |env,opts|
  env['REQUEST_METHOD'] = 'POST'
end

Warden::Strategies.add(:password) do
  def valid?
    params['user']['username'] && params['user']['password']
  end

  def authenticate!
    user = User.first(username: params['user']['username'])

    if user.nil?
      fail!("The username you entered does not exist.")
    elsif user.authenticate(params['user']['password'])
      success!(user)
    else
      fail!("Could not log in")
    end
  end
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

# The original of the following and other auth code can be found at:
# https://sklise.com/2013/03/08/sinatra-warden-auth/

# This route seems unnecessary since I want the login form to be a modal.
#get '/auth/login' do
#  erb :login
#end

post '/auth/login' do
  env['warden'].authenticate!

  flash[:success] = env['warden'].message

  if session[:return_to].nil?
    redirect '/'
  else
    redirect session[:return_to]
  end
end

get '/auth/logout' do
  env['warden'].raw_session.inspect
  env['warden'].logout
  flash[:success] = 'Successfully logged out'
  redirect '/'
end

post '/auth/unauthenticated' do
  session[:return_to] = env['warden.options'][:attempted_path]
  puts env['warden.options'][:attempted_path]
  flash[:error] = env['warden'].message || "You must log in"
  redirect '/auth/login'
end

get '/protected' do
  env['warden'].authenticate!
  @current_user = env['warden'].user
  erb :protected
end