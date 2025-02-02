# frozen_string_literal: true

require "rails_helper"

RSpec.describe "InertiaExample", type: :system do
  it "renders the text and increments the counter" do
    visit inertia_example_path(name: "TestUser")

    expect(page).to have_content("Hello TestUser!")
    expect(page).to have_content("count is 0")

    find("button", text: "count is 0").click

    expect(page).to have_content("count is 1")
  end
end
