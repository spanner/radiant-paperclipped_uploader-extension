# Paperclipped Uploader

This adds a friendly batch-uploader to paperclipped, with progress bars and a very simple interface. We use SWFupload to do most of the work. 

## Latest

The completion of each upload triggers an ajax call to drop a simple description form into what was previously the progress bar, so it's now possible to cue up a batch of uploads and describe them when they finish. it needs some cosmetic improvements but it's very quick and easy.

## Status

It works. It's very new but reasonably tidy. The next version will work a bit better and look a lot better.

## Installation

The usual:

	git submodule add git://github.com/spanner/radiant-paperclipped_uploader-extension.git vendor/extensions/forum
	rake radiant:extensions:paperclipped_uploader:update

The update task brings in quite a lot of clutter: javascript, flash, a bit of css, a link image.

## Warnings

* At the moment you need our [fork of paperclipped](https://github.com/spanner/paperclipped) for this to work: flash uploads don't come with content-types so we've had to intervene.
* Flash uploads don't come with cookies or other useful context either, so there is a semi-standard hack in the submission code to send that information by POST instead, and another couple in CGI::Session to get it out again.
*  I've stuck with paperclipped's prototype/lowpro setup for the javascript, so it's easy to integrate but not very nice.
* There's only a couple of mornings' work in this so handle with care!

## Author & Copyright

* William Ross, for spanner. will at spanner.org
* Copyright 2009 spanner ltd
* released under the same terms as Rails and/or Radiant