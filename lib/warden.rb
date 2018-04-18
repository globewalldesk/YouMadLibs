class MyApp < Sinatra::Base
  # The original of the following and other auth code can be found at:
  # https://sklise.com/2013/03/08/sinatra-warden-auth/
  # Then edited with the help of https://github.com/simonneutert/sinatras-skeleton/

use Warden::Manager do |config|
    config.serialize_into_session{|user| user.id }
    config.serialize_from_session{|id| User.find(id) } # was User.get(id) #???
    config.scope_defaults :default,
                          strategies: [:password],
                          action: 'auth/unauthenticated'
    config.failure_app = self
  end

  Warden::Manager.before_failure do |env,opts|
    env['REQUEST_METHOD'] = 'POST'
    env.each do |key, _value|
      env[key]['_method'] = 'post' if key == 'rack.request.form_hash'
    end
  end

  Warden::Strategies.add(:password) do
    def valid?
      params['user']['username'] && params['user']['password']
    end

    def authenticate!
      user = User.find_by(username: params['user']['username'])

      if user.nil?
        # throw(:warden, message: 'The username you entered does not exist.')
      elsif user.authenticate(params['user']['password'])
        success!(user)
      else
        throw(:warden, message: 'The username and password combination make me nervous.')
      end
    end
  end

  post '/auth/login' do
    env['warden'].authenticate!
    flash[:success] = "You're logged in."
    if session[:return_to].nil?
      redirect '/'
    else
      redirect session[:return_to]
    end
  end

  get '/auth/logout' do
    env['warden'].raw_session.inspect
    env['warden'].logout
    flash[:success] = "You've logged out."
    redirect '/'
  end

  post '/auth/unauthenticated' do
    session[:return_to] = env['warden.options'][:attempted_path]
    puts env['warden.options'][:attempted_path]
    flash[:error] = env['warden'].message || "You must log in."
    redirect '/auth/login'
  end

  get '/protected' do
    env['warden'].authenticate!
    @current_user = env['warden'].user
    erb :protected
  end

end # of class MyApp
