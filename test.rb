require 'json'

madlibs = JSON.parse(File.read('madlibs.json'))
filenames = madlibs.map do |madlib|
  madlib['file']
end
p filenames
filenames = filenames.push("ml10")
file_numbers = filenames.map do |filename|
  p filename
  p filename[/\d+/]
  filename.gsub(/^ml(\d+)$/, "\1").to_i
end
num = file_numbers.max + 1
new_filename = "ml#{num}.txt"
new_file_id = "ml#{num}"
puts "new_file_id = #{new_file_id}"