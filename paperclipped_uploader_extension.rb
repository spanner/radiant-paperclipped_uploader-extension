# Uncomment this if you reference any of your controllers in activate
# require_dependency 'application'

class PaperclippedUploaderExtension < Radiant::Extension
  version "1.1"
  description "Adds a simple and friendly upload queue to paperclipped."
  url "http://spanner.org/radiant/paperclipped_uploader"
  
  define_routes do |map|
    map.with_options(:controller => 'admin/assets') do |asset|
      asset.upload_assets "/admin/assets/uploader", :action => 'upload'
      asset.describe_new_asset "/admin/assets/describer", :action => 'describe'
      asset.describe_asset "/admin/assets/:id/describe", :action => 'describe'
    end
  end
  
  def activate
    require 'session_cookie_hack'     # to avoid duplicate alias_chains
    Asset.send :include, UploadableAsset
    Admin::AssetsController.send :include, AssetsControllerExtension

    if admin.tabs['Assets'] && admin.tabs['Assets'].respond_to?(:add_link)
      admin.tabs['Assets'].add_link('asset list', '/admin/assets')
      admin.tabs['Assets'].add_link('uploader', '/admin/assets/uploader')
    end
    
  end
  
  def deactivate
  end
  
end
