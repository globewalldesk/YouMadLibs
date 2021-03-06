configure :development do
  set :database, {adapter: "sqlite3", database: "db/madlibs.sqlite3"}
  set :show_exceptions, true
end

configure :production do
  db = URI.parse(ENV['DATABASE_URL'] || 'postgres://localhost/mydb')

  ActiveRecord::Base.establish_connection(
      :adapter  => db.scheme == 'postgres' ? 'postgresql' : db.scheme,
      :host     => db.host,
      :username => db.user,
      :password => db.password,
      :database => db.path[1..-1],
      :encoding => 'utf8'
  )
end

class MyApp < Sinatra::Base
  # get assets
  get '/public/*' do
    env['PATH_INFO'].sub!('/public', '')
    settings.environment.call(env)
  end
end