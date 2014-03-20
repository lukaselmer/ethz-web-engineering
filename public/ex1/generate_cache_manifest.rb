File.open('cache.appcache', 'w') do |f|
  f.puts "CACHE MANIFEST"
  f.puts "# v = 1.0.0"
  f.puts 'FALLBACK :'
  f.puts '    / /index.html'
  %w(js css images).each do |folder|
    Dir.glob("#{folder}/**/*.*") do |file|
      f.puts "#{file}"
    end
  end
end
