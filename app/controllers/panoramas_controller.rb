class PanoramasController < ApplicationController

  def index
    @panoramas = Panorama.all order: "created_at DESC"
  end

  def create
    @panorama = Panorama.new panorama_params
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

  private

    def panorama_params
      params.require(:panorama).permit(:fullsize, :preview)
    end

end
