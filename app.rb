require 'sinatra'
require 'json'
enable :sessions

set :protection, :except => :frame_options
set :bind, '0.0.0.0'

def load_texts
  texts = {}
  dirnames = Dir["texts/*.txt"]
  dirnames.each do |text|
    textid = text[6..-5]
    texts[textid] = File.read(text)
  end
  texts.to_json
end

get('/') do
  puts "hi there"
  @madlibs = File.read('madlibs.json')
  @all_texts = load_texts
  erb :index, :locals => { host: request.host }
end

post('/save') do
  # Determine new file number and filename.
  madlibs = JSON.parse(File.read('madlibs.json'))
  filenames = madlibs.map do |madlib|
    madlib['file']
  end
  file_numbers = filenames.map do |filename|
    filename[/\d+/].to_i
  end
  num = file_numbers.max + 1
  new_filename = "ml#{num}.txt"
  new_file_id = "ml#{num}"
  # Save text to new filename.
  File.open("texts/#{new_filename}", "w") do |file|
    file.write(params[:newtext])
  end
  # Open and load madlibs.json.
  new_madlib_data = {'file' => new_file_id, 'title' => params['title'], "author" => params['author'], "description" => params['description']}
  madlibs.push(new_madlib_data)
  # Add new madlib data to file.
  File.open("madlibs.json", "w") do |file|
    file.write(JSON.pretty_generate(madlibs))
  end
  redirect '/'
end
