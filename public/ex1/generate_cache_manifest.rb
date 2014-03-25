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
      f.puts "#{file}" unless file.ends_with? '.psd'
    end
  end
  
  f.puts 'FALLBACK :'
  f.puts '    / /index.html'
end
