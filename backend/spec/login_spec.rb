# spec/app_spec.rb
require 'rack/test'
require 'rspec'
require_relative '../myapi.rb' 

ENV['RACK_ENV'] = 'test'

RSpec.describe 'Personal Manager App' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  describe 'POST /signup' do
    it 'Signs up a new user with unique credentials' do
      username = "testuser_#{Time.now.to_i}_#{rand(1000)}"
      post '/signup', { username: username, password: 'testpassword' }.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(200)
      body = JSON.parse(last_response.body)
      expect(body["message"]).to include("User created successfully")
    end
    it 'Signs up a existing userid' do
      username = "Sharan"
      post '/signup', { username: username, password: '12345678' }.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(409)
      body = JSON.parse(last_response.body)
      expect(body["error"]).to include("Username already exists")
    end
  end
  describe 'POST /login' do
    it 'Login with with unique credentials' do
      payload= {username: "Sharan", password: "12345678"}
      post '/login', payload.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(200)
      
      body = JSON.parse(last_response.body)
      expect(body["message"]).to eq("Login successful")
    end
  end
end


