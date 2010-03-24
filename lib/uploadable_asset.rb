module UploadableAsset      # for inclusion into Asset
  def uploaded_file=(upload)
    logger.warn "^^ uploaded content type is #{File.mime_type?(upload)}"
    upload.content_type = File.mime_type?(upload)
    self.asset = upload
  end

end