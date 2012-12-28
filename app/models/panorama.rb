class Panorama < ActiveRecord::Base
  attr_accessible :fullsize, :preview
  validates :fullsize, presence: true, format: { with: URI::regexp(%w(http https)) }
  validates :preview, presence: true, format: { with: URI::regexp(%w(http https)) }
end
