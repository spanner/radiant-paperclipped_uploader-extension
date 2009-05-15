namespace :radiant do
  namespace :extensions do
    namespace :paperclipped_uploader do
      
      desc "Runs the migration of the Paperclipped Uploader extension"
      task :migrate => :environment do
        require 'radiant/extension_migrator'
        if ENV["VERSION"]
          PaperclippedUploaderExtension.migrator.migrate(ENV["VERSION"].to_i)
        else
          PaperclippedUploaderExtension.migrator.migrate
        end
      end
      
      desc "Copies public assets of the Paperclipped Uploader to the instance public/ directory."
      task :update => :environment do
        is_svn_or_dir = proc {|path| path =~ /\.svn/ || File.directory?(path) }
        puts "Copying assets from PaperclippedUploaderExtension"
        Dir[PaperclippedUploaderExtension.root + "/public/**/*"].reject(&is_svn_or_dir).each do |file|
          path = file.sub(PaperclippedUploaderExtension.root, '')
          directory = File.dirname(path)
          mkdir_p RAILS_ROOT + directory
          cp file, RAILS_ROOT + path
        end
      end  
    end
  end
end
