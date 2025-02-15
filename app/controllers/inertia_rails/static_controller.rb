# frozen_string_literal: true

module InertiaRails
  class StaticController < ::InertiaController
    def static
      render inertia: params[:component]
    end
  end
end
