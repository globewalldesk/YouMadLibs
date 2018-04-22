class MyApp < Sinatra::Base

  get('/') do
    @ml_texts = Madlib.order("created_at DESC")
    @username = env['warden'].user.username if env['warden'].user
    @state = session[:state] if session[:state]
    session[:state] = ""
    @state_data = session[:state_data] if session[:state_data]
    session[:state_data] = ""
    erb :index
  end

  post('/save') do
    new_madlib_data = {title: params['title'], author: params['author'],
                       description: params['description'],
                       ml_text: params['ml_text']}
    new_madlib = Madlib.new(new_madlib_data)
    new_madlib.save
    redirect '/'
  end

  post('/save_edit') do
    # Need to check that the user is the same as the author! Need token system?
    ml = Madlib.find(params['id'].to_i)
    edited_madlib_data = {title: params['title'],
                       description: params['description'],
                       ml_text: params['ml_text']}
    ml.update(edited_madlib_data)
    session[:state] = 'edit_madlib'
    session[:state_data] = {id: params['id']}
    redirect '/'
  end

  post('/delete') do
    ml = Madlib.find(params['id'].to_i)
    ml.destroy
    redirect '/'
  end
end
