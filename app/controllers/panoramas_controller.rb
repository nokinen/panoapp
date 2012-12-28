class PanoramasController < ApplicationController
  
  def index
    @panoramas = Panorama.all
  end
  
  def create
    @panorama = Panorama.new params[:panorama]
    @panorama.save ? head(:created, location: @panorama) : head(:bad_request)
  end
  
  def show
    @panorama = Panorama.find params[:id]
  end
  
  def destroy
    @panorama = Panorama.find params[:id]
    @panorama.destroy
    
    render(nothing: true, status: 204)
  end

end
