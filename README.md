# Paperclipped Uploader

This adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface. We use SWFupload to do most of the work. The completion of each upload triggers an ajax call to drop a simple description form into what was previously the progress bar, so it's now possible to cue up a batch of uploads and describe them when they finish. It's very quick and easy to use.

## Latest

Updated to work with 0.8.0, flash 10 and the latest paperclipped. 

It's a bit clumsy at the moment because I haven't found a good way to add Rack middleware from an extension. You have to put this in your environment.rb:

	require "#{RAILS_ROOT}/vendor/extensions/paperclipped_uploader/lib/session_cookie_from_query_string"

and also this, **before** the `config.middleware.use ::Radiant::Cache` line:

	config.middleware.use SessionCookieFromQueryString

## Status

It works. It's new but quite tidy. It should handle errors reasonably well but only to report a failure.

## Installation

The usual:

	git submodule add git://github.com/spanner/radiant-paperclipped_uploader-extension.git vendor/extensions/paperclipped_uploader
	rake radiant:extensions:paperclipped_uploader:update

The update task brings in quite a lot of clutter: javascript, flash, a bit of css, a link image and some more spinners. You do need it all.

## Warnings

* At the moment you need our [fork of paperclipped](https://github.com/spanner/paperclipped) for this to work: flash uploads don't come with content-types so we've had to intervene.
* Flash uploads don't come with cookies or any other useful context either, so there is a semi-standard hack in the submission code to send that information by POST instead, and another couple in CGI::Session to get it out again.
*  I've stuck with paperclipped's prototype/lowpro setup for the javascript, so it's easy to integrate but not really very nice.

## Author & Copyright

* William Ross, for spanner. will at spanner.org
* Copyright 2009 spanner ltd
* released under the same terms as Rails and/or Radiant