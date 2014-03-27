File.open('cache.appcache', 'w') do |f|
  f.puts "CACHE MANIFEST"
  f.puts "# v = 1.0.2"
  
  f.puts
  
  f.puts 'CACHE:'
  f.puts 'index.html'
  f.puts 'reviewers.html'
  f.puts 'weekly.html'
  f.puts '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js'

  %w(js css images).each do |folder|
    Dir.glob("#{folder}/**/*.*") do |file|
      next if file.end_with? *%w(.psd .scss js/jquery.js)
      f.puts "#{file}"
    end
  end

  f.puts  
  f.puts 'FALLBACK :'
  f.puts '/ index.html'
end
