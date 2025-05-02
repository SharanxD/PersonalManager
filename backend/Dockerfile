FROM ruby:3.2

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install dependencies
RUN gem install bundler && bundle install

# Expose port Sinatra uses (default: 4567)
EXPOSE 5000

# Default command to run app.rb
CMD ["ruby", "myapi.rb"]
