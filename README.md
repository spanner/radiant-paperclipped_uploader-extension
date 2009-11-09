# Paperclipped Uploader

This adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface. We use SWFupload to do most of the work. 

The completion of each upload triggers a remote call to drop a simple description form into what was previously the progress bar, so it's now possible to cue up a batch of uploads and describe them when they finish. It's very quick and easy to use.

## Latest

* Updated to work with radiant 0.8.0, flash 10 and the latest paperclipped. 
* Default values can be set for the batch of uploads, then tweaked for each file
* works with tags from the `library` extension if installed
* if you have a 'copyright' column in your Assets, works with that too
* a token is passed with each upload so that we can retrieve it for description

That last change means you need to run the extension migrations.

## Status

It works. It's fairly tidy but has no tests. It should handle errors reasonably well but only to report a failure. It's not very nice to look at but I was going for simplicity. There's no point prettifying it until the new radiant interface comes in.

## Installation

The usual:

	git submodule add git://github.com/spanner/radiant-paperclipped_uploader-extension.git vendor/extensions/paperclipped_uploader
	rake radiant:extensions:paperclipped_uploader:update
	rake radiant:extensions:paperclipped_uploader:migrate

The update task brings in quite a lot of clutter: javascript, flash, a bit of css, a link image and some more spinners. You do need it all.

## Warnings

* Flash uploads don't come with cookies, so I've put a hack in the submission path to pass the session cookie in the query string and another one in the CookieStore middleware to get it out again. I really ought to do this by adding extra middleware but at the moment it's hard to do that cleanly from an extension.

* I've stuck with paperclipped's prototype/lowpro setup for the javascript, so it's easy to integrate but not really very nice.

* Be aware that this can put quite a heavy load on a slow server. Files are only uploaded one at a time but they are then queued for processing by Paperclip and if your uploads are completed more quickly than your imagemagick calls, you can end up with several images being processed at once. Once the server maxes out, later uploads will appear to fail. This would normally only happen in local testing, where the upload is quick and the processing often slow. In real use I've never seen it, even when uploading dozens of tiny layout images.

## Author & Copyright

* William Ross, for spanner. will at spanner.org
* Copyright 2009 spanner ltd
* released under the same terms as Rails and/or Radiant