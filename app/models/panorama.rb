class Panorama < ActiveRecord::Base
  validates :fullsize, presence: true, format: { with: URI::regexp(%w(http https)) }
  validates :preview, presence: true, format: { with: URI::regexp(%w(http https)) }
end
