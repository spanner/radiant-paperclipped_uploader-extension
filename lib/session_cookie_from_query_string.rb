require 'rack/utils'

class SessionCookieFromQueryString
  def initialize(app)
    @app = app
  end

  def call(env)
    if env['HTTP_USER_AGENT'] =~ /^(Adobe|Shockwave) Flash/
      session_key = ActionController::Base.session_options[:session_key]
      params = ::Rack::Utils.parse_query(env['QUERY_STRING'])
      unless params[session_key].nil?
        session_cookie = [ session_key, params.delete(session_key) ].join('=')
        env['HTTP_COOKIE'] = session_cookie.freeze
      end
    end
    
    @app.call(env)
  end
end
