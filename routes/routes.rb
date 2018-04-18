class MyApp < Sinatra::Base
  get('/') do
    @ml_texts = Madlib.order("created_at DESC")
    @title = "Welcome."
    erb :index
  end

  post('/save') do
    puts params.inspect
    new_madlib_data = {title: params['title'], author: params['author'], description: params['description'], ml_text: params['ml_text']}
    new_madlib = Madlib.new(new_madlib_data)
    new_madlib.save
    redirect '/'
  end
end
