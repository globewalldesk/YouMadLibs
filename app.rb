require 'sinatra'
enable :sessions
require 'json'

set :protection, :except => :frame_options
set :bind, '0.0.0.0'

def load_texts
  texts = {}
  dirnames = Dir["texts/*.txt"]
  dirnames.each do |text|
    fileID = text[6..-5] # E.g., 'ml23'
    texts[fileID] = File.read(text)
  end
  texts.to_json
end

get('/') do
  @madlibs = File.read('madlibs.json')
  @texts = load_texts
  erb :index, :locals => { host: request.host }
end

post('/save') do
  # Determine new file number and filename.
  madlibs = JSON.parse(File.read('madlibs.json'))
  filenames = madlibs.map do |madlib|
    madlib['file']
  end
  file_numbers = filenames.map do |filename|
    filename.gsub(/^ml(\d+)$/, '\1')
  end
  num = file_numbers.max.to_i + 1
  new_fileID = "ml#{num}"
  # Save text to new filename.
  File.open("texts/#{new_fileID}.txt", "w") do |file|
    file.write(params[:newtext])
  end
  # Open and load madlibs.json.
  new_madlib_data = {"file" => new_fileID, 
                     "title" => params['title'], 
                     "author" => params['author'], 
                     "description" => params['description']}
  madlibs.push(new_madlib_data)
  # Add new madlib data to file.
  File.open("madlibs.json", "w") do |file|
    file.write(JSON.pretty_generate(madlibs))
  end
  redirect '/'
end
