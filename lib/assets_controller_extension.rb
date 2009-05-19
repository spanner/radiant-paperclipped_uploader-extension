module AssetsControllerExtension

  def upload
    if request.post?
      @asset = Asset.create! :asset => params[:Filedata]
      render :nothing => true
    end
  end
  
  def describe
    if params[:filename]                                                                  # return value from the upload is to the swf file, not to javascript, so we generally don't have asset id
      file_name = params[:filename].strip.gsub(/[^\w\d\.\-]+/, '_')                       # (copied from paperclip to match filename processing on upload)
      @asset = Asset.find_by_asset_file_name(file_name, :order => 'created_at desc')      # but we do have the filename, so we do the best we can with that.
    else
      @asset = Asset.find(params[:id])
    end
    if request.put?
      @asset.update_attributes!(params[:asset])
      render :partial => 'description', :layout => false
    else
      render :partial => 'describe', :layout => false
    end
  rescue => e
    @error = e
    render :partial => 'upload_error', :layout => false
  end
  
end
