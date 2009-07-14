module AssetsControllerExtension

  def upload  
    if request.post?
      @asset = Asset.new(:title => params[:Filename])
      @asset.uploaded_file = params[:Filedata]
      @asset.save!
      session["upload_#{params[:Filename]}".intern] = @asset.id
      render :nothing => true
    end
  rescue => e
    @error = e
    logger.warn "!!  file upload error: #{e.inspect}"
    render :partial => 'upload_error', :layout => false, :status => 500                    # SWFupload only cares about response status
  end
  
  def describe
    if params[:filename]                                                                  # return from the upload is to the swf file, not to javascript, so we generally don't have asset id but we do have the filename, so we do the best we can with that.
      file_name = params[:filename].strip.gsub(/[^\w\d\.\-]+/, '_')                       # copied from paperclip to match filename processing on upload
      @asset = Asset.find_by_asset_file_name(file_name, :order => 'created_at desc')      
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
    logger.warn "file description error: #{e.inspect}"
    render :partial => 'upload_error', :layout => false
  end
  
end

#! we want to call an uploaded_asset= method and set mime-type
# rather than post-processing in paperclip, which is nasty