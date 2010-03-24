# Uncomment this if you reference any of your controllers in activate
require_dependency 'application_controller'

class PaperclippedUploaderExtension < Radiant::Extension
  version "1.2"
  description "A plain but effective asset uploader based on swfupload. Extends paperclipped."
  url "http://spanner.org/radiant/paperclipped_uploader"
  
  define_routes do |map|
    map.with_options(:controller => 'admin/assets') do |asset|
      asset.upload_assets "/admin/assets/uploader", :action => 'upload'
      asset.describe_new_asset "/admin/assets/describer", :action => 'describe'
      asset.describe_asset "/admin/assets/:id/describe", :action => 'describe'
    end
  end
  
  def activate
    ActionController::Dispatcher.middleware.insert_before(ActionController::Base.session_store, SessionCookieFromQueryString)
    Asset.send :include, UploadableAsset
    Admin::AssetsController.send :include, AssetsControllerExtension
  end
  
  def deactivate
  end
  
end
