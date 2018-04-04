require 'sinatra'
enable :sessions

def load_texts
  texts = {}
  dirnames = Dir["texts/*.txt"]
  dirnames.each do |text|
    textid = text[6..-1]
    texts[textid] = File.read(text)
  end
  texts.to_json
end

get('/') do
  @madlibs = File.read('madlibs.json')
  @text = load_texts
  erb :main
end