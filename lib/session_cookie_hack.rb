module SessionCookieHack

  def self.included(base)
    base.class_eval {
      def call_with_hack(env)
        if env['HTTP_USER_AGENT'] =~ /^(Adobe|Shockwave) Flash/
          session_key = ActionController::Base.session_options[:session_key]
          params = ::Rack::Utils.parse_query(env['QUERY_STRING'])
          unless params[session_key].nil?
            session_cookie = [ session_key, params.delete(session_key) ].join('=')
            env['HTTP_COOKIE'] = session_cookie.freeze
          end
        end
        call_without_hack(env)
      end

      alias_method_chain :call, :hack
    }
  end
end

ActionController::Session::CookieStore.send :include, SessionCookieHack
