module UploadableAsset      # for inclusion into Asset
  require 'mime/types'

  def uploaded_file=(upload)
    upload.content_type = MIME::Types.type_for(upload.original_filename).to_s
    self.asset = upload
  end

end