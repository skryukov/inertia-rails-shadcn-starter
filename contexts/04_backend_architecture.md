# Backend Architecture

The backend is built with Ruby on Rails 8.0.1 and follows conventional Rails patterns with specific adaptations for Inertia.js integration.

## Controller Architecture

Controllers in the application are divided into two main types:

### 1. Standard Rails Controllers

All controllers inherit from `ApplicationController` which sets up authentication and other shared functionality:

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  inertia_share flash: -> { flash.to_hash }

  before_action :set_current_request_details
  before_action :authenticate

  private

  def authenticate
    redirect_to sign_in_path unless perform_authentication
  end

  def require_no_authentication
    return unless perform_authentication

    flash[:notice] = "You are already signed in"
    redirect_to root_path
  end

  def perform_authentication
    Current.session ||= Session.find_by_id(cookies.signed[:session_token])
  end

  def set_current_request_details
    Current.user_agent = request.user_agent
    Current.ip_address = request.ip
  end
end
```

### 2. Inertia-Specific Controllers

The application includes an `InertiaController` which extends `ApplicationController` with Inertia-specific functionality:

```ruby
# app/controllers/inertia_controller.rb
class InertiaController < ApplicationController
  inertia_config default_render: true
  inertia_share flash: -> { flash.to_hash },
      auth: {
        user: -> { Current.user.as_json(only: %i[id name email verified created_at updated_at]) },
        session: -> { Current.session.as_json(only: %i[id]) }
      }

  private

  def inertia_errors(model, full_messages: true)
    {
      errors: model.errors.to_hash(full_messages).transform_values(&:to_sentence)
    }
  end
end
```

Most feature controllers inherit from `InertiaController` to leverage the Inertia integration.

## Controller Organization

Controllers are organized by domain:

- `DashboardController` - Handles the main dashboard view
- `HomeController` - Manages the public homepage
- `SessionsController` - Manages user sessions (login/logout)
- `UsersController` - Handles user registration and account deletion

Namespaced controllers for specific features:

- `Identity::EmailVerificationsController` - Email verification flow
- `Identity::EmailsController` - Email update functionality
- `Identity::PasswordResetsController` - Password reset flow

Settings controllers:

- `Settings::ProfilesController` - User profile settings
- `Settings::PasswordsController` - Password update functionality
- `Settings::EmailsController` - Email settings management
- `Settings::SessionsController` - Session management

## Model Architecture

Key models in the application:

### User Model

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end

  has_many :sessions, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: {with: URI::MailTo::EMAIL_REGEXP}
  validates :password, allow_nil: true, length: {minimum: 12}

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end
end
```

### Session Model

```ruby
# app/models/session.rb
class Session < ApplicationRecord
  belongs_to :user

  before_create do
    self.user_agent = Current.user_agent
    self.ip_address = Current.ip_address
  end
end
```

### Current Object

Rails 7+ `CurrentAttributes` pattern for request-scoped global state:

```ruby
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :session
  attribute :user_agent, :ip_address

  delegate :user, to: :session, allow_nil: true
end
```

## Database Schema

The application uses a simple schema:

```ruby
# db/schema.rb (simplified)
create_table "sessions", force: :cascade do |t|
  t.integer "user_id", null: false
  t.string "user_agent"
  t.string "ip_address"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["user_id"], name: "index_sessions_on_user_id"
end

create_table "users", force: :cascade do |t|
  t.string "name", null: false
  t.string "email", null: false
  t.string "password_digest", null: false
  t.boolean "verified", default: false, null: false
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["email"], name: "index_users_on_email", unique: true
end
```

## Routing

Routes are defined in `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  get  "sign_in", to: "sessions#new", as: :sign_in
  post "sign_in", to: "sessions#create"
  get  "sign_up", to: "users#new", as: :sign_up
  post "sign_up", to: "users#create"

  resources :sessions, only: [:destroy]
  resource :users, only: [:destroy]

  namespace :identity do
    resource :email,              only: [:edit, :update]
    resource :email_verification, only: [:show, :create]
    resource :password_reset,     only: [:new, :edit, :create, :update]
  end

  get :dashboard, to: "dashboard#index"

  namespace :settings do
    resource :profile, only: [:show, :update]
    resource :password, only: [:show, :update]
    resource :email, only: [:show, :update]
    resources :sessions, only: [:index]
  end
  inertia "settings/appearance" => "settings/appearance"

  root "home#index"
end
```

Note the special `inertia` route helper, which creates a route that renders an Inertia page without requiring a controller method.

## Inertia Integration

Inertia.js is integrated via the `inertia_rails` gem and configured in `config/initializers/inertia_rails.rb`:

```ruby
InertiaRails.configure do |config|
  config.version = ViteRuby.digest
  config.encrypt_history = true
  # remove once https://github.com/inertiajs/inertia-rails/pull/196 is merged
  config.ssr_enabled = ENV.fetch("INERTIA_SSR_ENABLED", false)
  config.ssr_url = ENV.fetch("INERTIA_SSR_URL", "http://localhost:13714")
end
```

The integration works by:

1. Controller actions render Inertia responses using `render inertia: "ComponentName"` 
2. For all controllers inheriting from `InertiaController`, the default is to render the component matching the controller and action
3. Data is shared with the frontend using `inertia_share`

## Mailers

The application includes mailers for user notifications:

```ruby
# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  def password_reset
    @user = params[:user]
    @signed_id = @user.generate_token_for(:password_reset)

    mail to: @user.email, subject: "Reset your password"
  end

  def email_verification
    @user = params[:user]
    @signed_id = @user.generate_token_for(:email_verification)

    mail to: @user.email, subject: "Verify your email"
  end
end
```

## Background Jobs and Queuing

The application uses Solid Queue for background job processing:

```ruby
# config/environments/production.rb
config.active_job.queue_adapter = :solid_queue
config.solid_queue.connects_to = {database: {writing: :queue}}
```

```ruby
# config/queue.yml
default: &default
  dispatchers:
    - polling_interval: 1
      batch_size: 500
  workers:
    - queues: "*"
      threads: 3
      processes: <%= ENV.fetch("JOB_CONCURRENCY", 1) %>
      polling_interval: 0.1
```

## Caching

The application uses Solid Cache for caching:

```ruby
# config/environments/production.rb
config.cache_store = :solid_cache_store
```

## Views

Since this is an Inertia.js application, Ruby views are minimal. The main layout is in `app/views/layouts/application.html.erb` which loads the JavaScript and CSS assets.

The bulk of the UI is implemented in React components.
