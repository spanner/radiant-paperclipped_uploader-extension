# Uncomment this if you reference any of your controllers in activate
# require_dependency 'application'

class PaperclippedUploaderExtension < Radiant::Extension
  version "1.1"
  description "A plain but highly effective asset uploader. Extends paperclipped."
  url "http://spanner.org/radiant/paperclipped_uploader"
  
  define_routes do |map|
    map.with_options(:controller => 'admin/assets') do |asset|
      asset.upload_assets "/admin/asset_uploader", :action => 'upload'
      asset.describe_new_asset "/admin/asset_describer", :action => 'describe'
      asset.describe_asset "/admin/assets/:id/describe", :action => 'describe'
    end
  end
  
  extension_config do |config|
    # config.gem 'mime-types'
    config.extension 'paperclipped'
    # session cookie will move into middleware here
  end
  
  def activate
    require 'session_cookie_hack'     # require is to avoid duplicate alias_chains
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
