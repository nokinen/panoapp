Panoapp::Application.routes.draw do

  get "policy/generate"
  root to: "panoramas#index"

  resources :panoramas, only: [:index, :create, :show, :destroy]
  resources :sessions, only: [:new, :create, :destroy]

  match 'login', to: 'sessions#new', via: :get
  match 'logout', to: 'sessions#destroy', via: :delete

end
