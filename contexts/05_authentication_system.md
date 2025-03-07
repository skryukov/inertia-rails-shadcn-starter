# Authentication System

The application includes a custom authentication system based on the Authentication Zero pattern. This system provides user registration, login, session management, email verification, and password reset functionality.

## Key Features

- User registration and login
- Secure password storage with bcrypt
- Email verification flow
- Password reset functionality
- Session management (multi-device support)
- Account settings (update profile, email, password)

## Models

### User Model

The core of the authentication system is the `User` model:

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

Key aspects:
- `has_secure_password` provides password hashing with bcrypt
- Token generation for email verification and password reset
- Email normalization to ensure consistent formatting
- Automatic unverification of email when changed
- Session invalidation when password is changed

### Session Model

The `Session` model tracks user login sessions:

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

This enables multi-device login tracking with browser and IP information.

### Current Object

The `Current` object provides access to the current user and session:

```ruby
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :session
  attribute :user_agent, :ip_address

  delegate :user, to: :session, allow_nil: true
end
```

This uses Rails' `ActiveSupport::CurrentAttributes` for request-scoped global state.

## Authentication Flow

### Registration Process

1. User submits registration form
2. `UsersController#create` creates a new user record
3. A session is automatically created for the new user
4. Verification email is sent to the user's email
5. User is redirected to the dashboard

```ruby
# app/controllers/users_controller.rb (simplified)
def create
  @user = User.new(user_params)

  if @user.save
    session_record = @user.sessions.create!
    cookies.signed.permanent[:session_token] = {value: session_record.id, httponly: true}

    send_email_verification
    redirect_to dashboard_path, notice: "Welcome! You have signed up successfully"
  else
    redirect_to sign_up_path, inertia: inertia_errors(@user)
  end
end
```

### Login Process

1. User submits login form
2. `SessionsController#create` authenticates the user
3. A new session is created
4. Session token is stored in a secure cookie
5. User is redirected to the dashboard

```ruby
# app/controllers/sessions_controller.rb (simplified)
def create
  if user = User.authenticate_by(email: params[:email], password: params[:password])
    @session = user.sessions.create!
    cookies.signed.permanent[:session_token] = {value: @session.id, httponly: true}

    redirect_to dashboard_path, notice: "Signed in successfully"
  else
    redirect_to sign_in_path, alert: "That email or password is incorrect"
  end
end
```

### Authentication Verification

Every request is checked for authentication by the `ApplicationController`:

```ruby
# app/controllers/application_controller.rb
def authenticate
  redirect_to sign_in_path unless perform_authentication
end

def perform_authentication
  Current.session ||= Session.find_by_id(cookies.signed[:session_token])
end
```

This loads the current session from the secure cookie and delegates to the `Current` object.

### Email Verification

1. Verification email contains a secure token
2. User clicks the verification link
3. `Identity::EmailVerificationsController#show` verifies the email
4. User's account is marked as verified

```ruby
# app/controllers/identity/email_verifications_controller.rb
def show
  @user.update! verified: true
  redirect_to root_path, notice: "Thank you for verifying your email address"
end
```

### Password Reset

1. User requests password reset
2. System generates a secure, time-limited token
3. Reset link is sent to user's email
4. User clicks the link and provides a new password
5. `Identity::PasswordResetsController#update` updates the password

```ruby
# app/controllers/identity/password_resets_controller.rb
def update
  if @user.update(user_params)
    redirect_to sign_in_path, notice: "Your password was reset successfully. Please sign in"
  else
    redirect_to edit_identity_password_reset_path(sid: params[:sid]), inertia: inertia_errors(@user)
  end
end
```

## Frontend Authentication Components

The authentication system includes React components for the user interface:

### Login Form

```tsx
// app/frontend/pages/sessions/new.tsx
export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
    email: "",
    password: "",
    remember: false,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(signInPath(), {
      onFinish: () => reset("password"),
    })
  }

  return (
    <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
      <Head title="Log in" />
      <form className="flex flex-col gap-6" onSubmit={submit}>
        {/* Form fields */}
      </form>
    </AuthLayout>
  )
}
```

### Registration Form

```tsx
// app/frontend/pages/users/new.tsx
export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(signUpPath(), {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  // Component JSX
}
```

### Password Reset Form

```tsx
// app/frontend/pages/identity/password_resets/edit.tsx
export default function ResetPassword({ sid, email }: ResetPasswordProps) {
  const { data, setData, put, processing, errors, reset } = useForm<ResetPasswordForm>({
    sid: sid,
    email: email,
    password: "",
    password_confirmation: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    put(identityPasswordResetPath(), {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  // Component JSX
}
```

## Session Management

The application allows users to view and manage their active sessions:

```ruby
# app/controllers/settings/sessions_controller.rb
def index
  sessions = Current.user.sessions.order(created_at: :desc)
  render inertia: {sessions: sessions.as_json(only: %i[id user_agent ip_address created_at])}
end
```

Users can view their active sessions and log out individual sessions:

```ruby
# app/controllers/sessions_controller.rb
def destroy
  @session.destroy!
  Current.session = nil
  redirect_to settings_sessions_path, notice: "That session has been logged out", inertia: {clear_history: true}
end
```

## Security Features

The authentication system includes several security features:

- **Password Security**: Passwords are hashed using bcrypt and require a minimum of 12 characters
- **Secure Cookies**: Session tokens are stored in signed, HTTPOnly cookies
- **Token Expiration**: Email verification and password reset tokens have expiration times
- **Account Protection**: Changing email requires re-verification, changing password invalidates other sessions
- **Password Challenge**: Sensitive operations (like changing email) require password confirmation
- **Email Normalization**: Emails are normalized to prevent duplicate accounts with similar emails
- **CSRF Protection**: Rails' built-in CSRF protection is enabled

## User Settings

The application provides interfaces for users to update their information:

- **Profile Settings**: Update name and delete account
- **Email Settings**: Update email address (requires verification)
- **Password Settings**: Update password (invalidates other sessions)
- **Session Settings**: View and manage active sessions

These settings are implemented as controllers in the `Settings` namespace with corresponding Inertia pages.
