class AssetUploadToken < ActiveRecord::Migration
  def self.up
    add_column :assets, :upload_token, :string
  end

  def self.down
    remove_column :assets, :upload_token
  end
end
