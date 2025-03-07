# Testing and Quality Assurance

## TL;DR

The application uses RSpec for testing, with a focus on controller/request specs and mailer specs. Factory Bot provides test data generation. Code quality is maintained using RuboCop for Ruby code linting, ESLint/Prettier for JavaScript/TypeScript, and Brakeman for security scanning.

## Testing Framework

The application uses RSpec as its primary testing framework, configured in `spec/rails_helper.rb` and `spec/spec_helper.rb`.

```ruby
# spec/rails_helper.rb (key sections)
require 'spec_helper'
require 'rspec/rails'
require 'support/authentication_helpers'

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  config.include AuthenticationHelpers
end
```

## Test Types and Organization

### Request Specs

The primary testing approach is through request specs, which test the full HTTP request/response cycle:

```ruby
# spec/requests/sessions_spec.rb
require 'rails_helper'

RSpec.describe "Sessions", type: :request do
  describe "POST /sign_in" do
    let(:user) { create(:user) }

    it "signs in the user" do
      post sign_in_path, params: { email: user.email, password: "password123" }
      expect(response).to redirect_to(dashboard_path)
    end

    it "handles invalid credentials" do
      post sign_in_path, params: { email: user.email, password: "wrong" }
      expect(response).to redirect_to(sign_in_path)
      expect(flash[:alert]).to be_present
    end
  end
end
```

### Mailer Specs

The application includes mailer specs for testing email functionality:

```ruby
# spec/mailers/user_mailer_spec.rb
require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  describe "email_verification" do
    let(:user) { create(:user) }
    let(:mail) { UserMailer.with(user: user).email_verification }

    it "renders the headers" do
      expect(mail.subject).to eq("Verify your email")
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Verify your email")
    end
  end
end
```

### Test Data Generation

Factory Bot is used for generating test data:

```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    name { "Test User" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    verified { true }

    factory :unverified_user do
      verified { false }
    end
  end
end
```

### Authentication Helpers

The application includes helpers for authentication in tests:

```ruby
# spec/support/authentication_helpers.rb
module AuthenticationHelpers
  def sign_in(user)
    post sign_in_path, params: { email: user.email, password: user.password }
  end
end
```

## Linting and Static Analysis

### Ruby Code Quality

Ruby code quality is maintained using RuboCop:

```ruby
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

AllCops:
  TargetRubyVersion: 3.4
  NewCops: enable
  Exclude:
    - 'bin/**/*'
    - 'db/schema.rb'
    - 'vendor/**/*'
    - 'node_modules/**/*'
```

RuboCop can be run via:

```bash
bin/rubocop
```

### JavaScript/TypeScript Quality

The project uses ESLint and Prettier for JavaScript/TypeScript code quality:

```javascript
// eslint.config.js
import js from "@eslint/js"
import pluginReact from "eslint-plugin-react"
import tseslint from "typescript-eslint"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier"

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  eslintConfigPrettier,
]
```

ESLint and Prettier can be run via:

```bash
# Check TypeScript types
npm run check

# Lint JavaScript/TypeScript files
npm run lint

# Format JavaScript/TypeScript files
npm run format

# Fix linting issues
npm run lint:fix

# Fix formatting issues
npm run format:fix
```

### Security Scanning

Brakeman is used for static security analysis:

```bash
bin/brakeman
```

## CI/CD Testing Integration

Tests are run as part of the CI/CD pipeline, ensuring that all code changes pass tests before deployment. The CI configuration is defined in the deployment system.

## Testing Best Practices

### Controller/Request Tests

- Test all controller actions and endpoints
- Verify both happy path and error conditions
- Check for appropriate redirects and status codes
- Verify flash messages for user feedback

### Mailer Tests

- Verify email headers (from, to, subject)
- Check email body content
- Test email links and tokens

### Authentication Tests

- Test user registration process
- Test user login and logout
- Test password reset functionality
- Test email verification

## Known Limitations

- Limited front-end testing (opportunity for Jest or Cypress integration)
- No system/integration tests using Capybara (though support is included)

## Performance Testing

No automated performance testing setup is included, but the application uses Rails built-in performance monitoring in production environments.
