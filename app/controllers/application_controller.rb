class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :mobile_device?
  
  private
  
  def mobile_device?
    request.user_agent =~ /Mobile|webOS/
  end
  
end
