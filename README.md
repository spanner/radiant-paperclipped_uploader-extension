# Paperclipped Uploader

This adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface. 

# How

We use SWFupload to do most of the work.x`z`

# Status

It works. It's very new and rather sloppy.

There's some functionality I want to add - when an upload completes I want to be able to enter metadata for that file - and there's a lot of cargo code in here that I'm gradually trimming. The next version will work a bit better and look a lot better.

# Installation

The usual:

	git submodule add git://github.com/spanner/radiant-paperclipped_uploader-extension.git vendor/extensions/forum
	rake radiant:extensions:paperclipped_uploader:update

The update task brings in quite a lot of clutter: javascript, flash, a bit of css, a link image.

# Warnings

* At the moment you need our [fork of paperclipped](https://github.com/spanner/paperclipped) for this to work: flash uploads don't come with content-types so we've had to intervene.
* Flash uploads also don't come with cookies or other useful context, so there is a hack in the submission code to send that information in the POST instead, and another hack in CGI::Session to get it out again.
* There's only a morning's work in this so handle with care!


## Author & Copyright

* William Ross, for spanner. will at spanner.org
* Copyright 2009 spanner ltd
* released under the same terms as Rails and/or Radiant