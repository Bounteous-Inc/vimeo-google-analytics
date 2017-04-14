# Vimeo Google Analytics & GTM Plugin

This is a plug-and-play tracking solution for tracking user interaction with Vimeo videos in Google Analytics. It will detect if GTM, Universal Analytics, or Classic Analytics is installed on the page, in that order, and use the first syntax it matches unless configured otherwise. It include support for delivering hits directly to Universal or Classic Google Analytics, or for pushing Data Layer events to be used by Google Tag Manager.

Once installed, the plugin will fire events with the following settings:
- Event Category: Videos
- Event Action: *&lt;Action, e.g. Play, Pause&gt;*
- Event Label: *&lt;URL of the video&gt;*

It will automatically bind to all videos on the page, even those added inserted dynamically after DOM Ready.

For installation instructions and complete documentation, visit [http://www.lunametrics.com/labs/recipes/vimeo-tracking-for-gtm/#documentation](http://www.lunametrics.com/labs/recipes/vimeo-tracking-for-gtm/#documentation).

## License

Licensed under the MIT License. For a complete copy of the license, please refer to the LICENSE.md file included with this repository.

## Acknowledgements

Created by the honest folks at [LunaMetrics](http://www.lunametrics.com/), a digital marketing & Google Analytics consultancy. For questions, please drop us a line here or [on our blog](http://www.lunametrics.com/blog/).

Written by [Dan Wilkerson](https://twitter.com/notdanwilkerson)
