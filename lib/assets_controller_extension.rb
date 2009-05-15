module AssetsControllerExtension

  def upload
    if request.post?
      @asset = Asset.create! :asset => params[:Filedata]
      render :nothing => true
    end
  end
  
end
