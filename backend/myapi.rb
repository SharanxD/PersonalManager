require 'sinatra'
require 'pg'
require 'bcrypt'
require 'json'
require 'rack/cors'
require 'jwt'

SECRET_KEY = 'SharanProject1'
DB = PG.connect(
  host: 'db',
  dbname: 'pmdb',  
  user: 'sharanubuntu',   
  password: 'admin', 
  port: 5432
)

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :options]
  end
end

options "*" do
  response.headers["Allow"] = "GET, POST, OPTIONS"
  response.headers["Access-Control-Allow-Origin"] = "*"
  response.headers["Access-Control-Allow-Headers"] = 'Authorization, Content-Type'
  200
end

before do
  content_type :json
  headers 'Access-Control-Allow-Origin' => '*'
end

error do
  err = env['sinatra.error']
  status 500
  { error: "Internal Server Error: #{err.message}" }.to_json
end


post '/signup' do
  data = JSON.parse(request.body.read)
  username = data["username"]
  password = data["password"]
  password = BCrypt::Password.create(password)

  begin
    DB.exec_params("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password])
    { message: "User created successfully" }.to_json
  rescue PG::UniqueViolation
    status 409
    { error: "Username already exists" }.to_json
  end
end

post '/login' do
  data = JSON.parse(request.body.read)
  username = data["username"]
  password = data["password"]
  result = DB.exec_params("SELECT * FROM users WHERE username = $1", [username])

  user = result.first

  if user && BCrypt::Password.new(user["password"]) == password
    payload = { user_id: username, exp: Time.now.to_i + 3600 }
    token = JWT.encode(payload, SECRET_KEY, 'HS256')

    DB.exec_params("INSERT INTO jwt (tokenid, logtime) VALUES ($1, NOW())", [token])

    { message: "Login successful", token: token }.to_json
  else
    status 401
    { error: "Invalid credentials" }.to_json
  end
end

get '/' do
  { message: "Welcome to my API!" }.to_json
end

get '/tasklist' do
  auth_header = request.env['HTTP_AUTHORIZATION']

  if auth_header && auth_header.start_with?('Bearer ')
    token = auth_header.split(' ').last
    begin
      decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
      username = decoded_token[0]["user_id"]

      results = DB.exec_params("SELECT * FROM tasks WHERE username = $1", [username])
      results.map { |row| row }.to_json

    rescue JWT::ExpiredSignature
      status 409
      { message: "JWT Expired Please login again." }.to_json

    rescue
      status 401
      { message: "JWT error" }.to_json
    end
  end
end

post '/tasks' do
  data = JSON.parse(request.body.read)
  username = data["username"]
  token = data["tokenid"]

  begin
    decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    jwtuser = decoded_token[0]["user_id"]

    if username == jwtuser
      title = data["title"]
      desc = data["description"]
      endtime = data["endtime"]

      DB.exec_params("INSERT INTO tasks (username, title, description, createtime, endtime) VALUES ($1, $2, $3, NOW(), $4)", [username, title, desc, endtime])

      { message: "Task added successfully" }.to_json
    else
      status 409
      { message: "JWT User error" }.to_json
    end

  rescue JWT::ExpiredSignature
    status 409
    { message: "JWT Expired Please login again." }.to_json

  rescue => e
    status 401
    { message: e.message }.to_json
  end
end

get '/noteslist' do
  auth_header = request.env['HTTP_AUTHORIZATION']

  if auth_header && auth_header.start_with?('Bearer ')
    token = auth_header.split(' ').last

    begin
      decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
      jwtuser = decoded_token[0]["user_id"]

      results = DB.exec_params("SELECT * FROM notes WHERE username = $1", [jwtuser])
      results.map { |row| row }.to_json

    rescue JWT::ExpiredSignature
      status 409
      { message: "JWT Expired Please login again." }.to_json

    rescue
      status 401
      { message: "JWT error" }.to_json
    end
  end
end

post '/notes' do
  data = JSON.parse(request.body.read)
  username = data["username"]
  token = data["tokenid"]

  begin
    decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    jwtuser = decoded_token[0]["user_id"]

    if username == jwtuser
      notedata = data["notedata"]

      DB.exec_params("INSERT INTO notes (username, notedata, createtime) VALUES ($1, $2, NOW())", [username, notedata])

      { message: "Notes added successfully" }.to_json
    else
      status 409
      { message: "JWT User error" }.to_json
    end

  rescue JWT::ExpiredSignature
    status 409
    { message: "JWT Expired Please login again." }.to_json

  rescue => e
    status 401
    { message: e.message }.to_json
  end
end


get '/alldata' do
  auth_header = request.env['HTTP_AUTHORIZATION']

  if auth_header && auth_header.start_with?('Bearer ')
    token = auth_header.split(' ').last
    begin
      decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
      username = decoded_token[0]["user_id"]

      resultstasks = DB.exec_params("SELECT * FROM tasks WHERE username = $1", [username])
      resultsnotes = DB.exec_params("SELECT * FROM notes WHERE username = $1", [username])
      tasks = resultstasks.map { |row| row }
      notes = resultsnotes.map { |row| row }
      result = {
  results: {
    tasks: tasks,
    notes: notes
  }
}
      result.to_json

    rescue JWT::ExpiredSignature
      status 409
      { message: "JWT Expired Please login again." }.to_json

    rescue
      status 401
      { message: "JWT error" }.to_json
    end
  end
end


post '/deletenote' do
  
  data = JSON.parse(request.body.read)
  note = data["notedata"];

  auth_header = request.env['HTTP_AUTHORIZATION']

  if auth_header && auth_header.start_with?('Bearer ')
    token = auth_header.split(' ').last
    begin
      decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
      username = decoded_token[0]["user_id"]
      
      DB.exec_params("DELETE FROM notes WHERE notedata = $1", [note])
      {message: "Note deleted Successfully"}.to_json

    rescue JWT::ExpiredSignature
      status 409
      { message: "JWT Expired Please login again." }.to_json
      

    rescue => e
      status 401
      { message: e.message }.to_json
    end
  end
end
post '/deletetask' do
  
  data = JSON.parse(request.body.read)
  task = data["title"];

  auth_header = request.env['HTTP_AUTHORIZATION']

  if auth_header && auth_header.start_with?('Bearer ')
    token = auth_header.split(' ').last
    begin
      decoded_token = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
      username = decoded_token[0]["user_id"]
      
      DB.exec_params("DELETE FROM tasks WHERE title = $1", [task])
      {message: "Task deleted Successfully"}.to_json

    rescue JWT::ExpiredSignature
      status 409
      { message: "JWT Expired Please login again." }.to_json
      

    rescue => e
      status 401
      { message: e.message }.to_json
    end
  end
end

set :port,5000
set :bind, '0.0.0.0'
