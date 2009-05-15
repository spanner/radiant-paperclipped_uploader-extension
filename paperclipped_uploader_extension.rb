# Uncomment this if you reference any of your controllers in activate
# require_dependency 'application'

class PaperclippedUploaderExtension < Radiant::Extension
  version "1.0"
  description "Adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface."
  url "http://spanner.org/radiant/paperclipped_uploader"
  
  define_routes do |map|
    map.with_options(:controller => 'assets') do |asset|
      asset.upload_assets "/admin/assets/upload", :action => 'upload'
    end
  end
  
  def activate
    PostalSessions
    AssetsController.send :include, AssetsControllerExtension
  end
  
  def deactivate
    # admin.tabs.remove "Paperclipped Uploader"
  end
  
end
