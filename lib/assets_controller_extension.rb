module AssetsControllerExtension

  def upload  
    if request.post?
      @asset = Asset.new(params[:asset])
      @asset.title ||= params[:Filename]
      @asset.uploaded_file = params[:Filedata]
      @asset.save!
      render :nothing => true
    end
  rescue => e
    @error = e
    logger.warn "Paperclipped_uploader file upload error: #{e.inspect}"
    render :partial => 'upload_error', :layout => false, :status => 500                    # SWFupload only cares about response status
  end
  
  def describe
    if params[:upload]
      @asset = Asset.find_by_upload_token(params[:upload] , :order => 'created_at desc')      
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
