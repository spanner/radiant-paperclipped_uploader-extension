require 'rack/utils'

class SessionCookieFromQueryString
  def initialize(app)
    @app = app
  end

  def call(env)
    
    if env['HTTP_USER_AGENT'] =~ /^(Adobe|Shockwave) Flash/
      params = ::Rack::Utils.parse_query(env['QUERY_STRING'])
      session_key = ActionController::Base.session_options[:session_key]
      Rails.logger.warn "!! session key is #{session_key}"
      Rails.logger.warn "!! key param is #{params[session_key]}"
      env['HTTP_COOKIE'] = [ session_key, params.delete(session_key) ].join('=').freeze unless params[session_key].nil?
    end
    @app.call(env)
  end
end
