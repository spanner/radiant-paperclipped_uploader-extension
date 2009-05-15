# hacks for swfupload + cookie store to work
# see http://blog.airbladesoftware.com/2007/8/8/uploading-files-with-swfupload
#
# also need to put
# session :cookie_only => false, :only => :create
# into the controller where the files are being uploaded (change method as appropriate)
#
# this goes in environment.rb
module PostalSessions
  
end

class CGI::Session
  def initialize_with_query_string(request, option = {})
    session_key = option['session_key'] || '_session_id'
    query_string = if (qs = request.env_table["QUERY_STRING"]) and qs != ""
      qs
    elsif (ru = request.env_table["REQUEST_URI"][0..-1]).include?("?")
      ru[(ru.index("?") + 1)..-1]
    end
    if query_string and query_string.include?(session_key)
      option['session_data'] = CGI.unescape(query_string.scan(/#{session_key}=(.*?)(&.*?)*$/).flatten.first)
    end
    initialize_without_query_string(request, option)
  end
  alias_method_chain :initialize, :query_string
end

class CGI::Session::CookieStore
  def initialize_with_query_string(session, options = {})
    @session_data = options['session_data']
    initialize_without_query_string(session, options)
  end
  alias_method_chain :initialize, :query_string

  def read_cookie
    cookie = @session_data || @session.cgi.cookies[@cookie_options['name']].first
    return cookie if cookie
    return unless @session.cgi.request_method == "POST" # && @session.cgi.user_agent =~ /Flash Player/  This condition is commented, because of Flash user-agent differs a lot
    session_id = ActionController::CgiRequest.new(@session.cgi, ActionController::Base.session_options).request_parameters[@cookie_options['name']]
    return unless session_id
    @session.instance_variable_set('@session_id', session_id)
  end
end
