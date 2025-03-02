# frozen_string_literal: true

InertiaRails.configure do |config|
  config.version = ViteRuby.digest
  config.encrypt_history = true
  # remove once https://github.com/inertiajs/inertia-rails/pull/196 is merged
  config.ssr_enabled = ENV.fetch("INERTIA_SSR_ENABLED", false)
  config.ssr_url = ENV.fetch("INERTIA_SSR_URL", "http://localhost:13714")
end

# remove once https://github.com/inertiajs/inertia-rails/pull/199 is merged
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
