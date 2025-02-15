# frozen_string_literal: true

InertiaRails.configure do |config|
  config.ssr_enabled = ViteRuby.config.ssr_build_enabled
  config.version = ViteRuby.digest
  config.encrypt_history = true

  # config.base_controller = 'InertiaController'
end

ActionController::Renderers.remove :inertia

ActionController::Renderers.add :inertia do |component, options|
  if component.is_a?(Hash) && options[:props].nil?
    options[:props] = component
    component = true
  end

  InertiaRails::Renderer.new(
    component,
    self,
    request,
    response,
    method(:render),
    props: options[:props],
    view_data: options[:view_data],
    deep_merge: options[:deep_merge],
    encrypt_history: options[:encrypt_history],
    clear_history: options[:clear_history],
    ).render
end
