module AssetsControllerExtension

  def upload
    if request.post?
      @asset = Asset.create! :asset => params[:Filedata]
      render :nothing => true
    end
  end
  
  def describe
    @asset = params[:id] ? Asset.find(params[:id]) : Asset.find_by_asset_file_name(params[:filename], :order => 'created_at desc')
    if request.put?
      @asset.update_attributes!(params[:asset])
      render :partial => 'description', :layout => false
    else
      render :partial => 'describe', :layout => false
    end
  end
  
end
