File.open('cache.appcache', 'w') do |f|
  f.puts "CACHE MANIFEST"
  f.puts "# v = 1.0.1"
  
  f.puts
  
  f.puts 'CACHE:'
  f.puts 'index.html'
  f.puts 'reviewers.html'
  f.puts 'weekly.html'
  
  %w(js css images).each do |folder|
    Dir.glob("#{folder}/**/*.*") do |file|
      next if file.end_with? *%w(.psd .scss js/jquery.js)
      f.puts "#{file}"
    end
  end

  f.puts  
  f.puts 'FALLBACK :'
  f.puts '    / /index.html'
end
