# Paperclipped Uploader

This adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface. We use SWFupload to do most of the work. 

The completion of each upload triggers a remote call to drop a simple description form into what was previously the progress bar, so it's now possible to cue up a batch of uploads and describe them when they finish. It's very quick and easy to use.

## Latest

Updated to work with radiant 0.8.0, flash 10 and the latest paperclipped. 
It should just work, but until this and paperclipped get proper tests it's hard to be sure. Bug reports very welcome.

## Status

It works. It's new but quite tidy. It should handle errors reasonably well but only to report a failure.

## Installation

The usual:

	git submodule add git://github.com/spanner/radiant-paperclipped_uploader-extension.git vendor/extensions/paperclipped_uploader
	rake radiant:extensions:paperclipped_uploader:update

The update task brings in quite a lot of clutter: javascript, flash, a bit of css, a link image and some more spinners. You do need it all.

## Warnings

* Flash uploads don't come with cookies, so I've put a hack in the submission path to pass the session cookie in the query string and another one in the CookieStore middleware to get it out again. I really ought to do this by adding extra middleware but at the moment it's hard to do that cleanly from an extension.

*  I've stuck with paperclipped's prototype/lowpro setup for the javascript, so it's easy to integrate but not really very nice.

## Author & Copyright

* William Ross, for spanner. will at spanner.org
* Copyright 2009 spanner ltd
* released under the same terms as Rails and/or Radiant