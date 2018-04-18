require 'rubygems'
require 'bundler'
Bundler.require
require 'sinatra'
require 'sinatra/base'
require 'sinatra/flash'
require 'sinatra/activerecord'
require 'warden'
require 'bcrypt'

enable :sessions

class Madlib < ActiveRecord::Base
end

# modular Sinatra app inherit from Sinatra::Base
class MyApp < Sinatra::Base
  # session support for your app
  use Rack::Session::Pool
  # flash messages are not integrated, yet
  # but loaded just in case someone finds the time
  register Sinatra::Flash
  set :root, File.dirname(__FILE__)
  # files in static are served on "root"
  set :public_folder, File.dirname(__FILE__) + '/public'

  # require libs; includes warden (authentication) routes.
  Dir['./lib/*.rb'].each { |file| require_relative file }
  # require configurations
  Dir['./config/*.rb'].each { |file| require_relative file }
  # require models
  Dir['./models/*.rb'].each { |file| require_relative file }
  # require routes
  Dir['./routes/*.rb'].each { |file| require_relative file; puts "file = #{file}" }

  run!
end
