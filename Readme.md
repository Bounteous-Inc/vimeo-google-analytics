# Vimeo Google Analytics & GTM Plugin

This is a plug-and-play tracking solution for tracking user interaction with Vimeo videos in Google Analytics. It will detect if GTM, Universal Analytics, or Classic Analytics is installed on the page, in that order, and use the first syntax it matches unless configured otherwise. It include support for delivering hits directly to Universal or Classic Google Analytics, or for pushing Data Layer events to be used by Google Tag Manager.

Once installed, the plugin will fire events with the following settings:
- Event Category: Videos
- Event Action: *&lt;Action, e.g. Play, Pause&gt;*
- Event Label: *&lt;URL of the video&gt;*

It will automatically bind to all videos on the page, even those added inserted dynamically after DOM Ready.

## Installation

### Universal or Classic Google Analytics Installation:

The plugin is designed to be plug-and-play. By default, the plugin will try and detect if you have Google Tag Manager, Universal Analytics, or Classic Google Analytics, and use the appropriate syntax for the event. If you are **not** using Google Tag Manager to fire your Google Analytics code, store the plugin on your server and include the lunametrics-vimeo.gtm.js script file somewhere on the page.

    <script src="/somewhere-on-your-server/lunametrics-vimeo.gtm.js"></script>

### Google Tag Manager Installation

#### Container Import (recommended)

1. Download the file 'luna-vimeo-tracking.json' from this repository.
2. In Google Tag Manager, navigate to the **Admin** tab.
3. Under the **Container** column, select **Import Container**.
4. Click **Choose Container File** and select the 'luna-vimeo-tracking.json' file you downloaded.
5. Select **Merge** from the radio selector beneath the Choose Container File button.
6. Select **Rename** from the radio selector that appears beneath the Merge selector.
7. Click Continue, then Confirm.
8. Navigate to the Tags interface - select the tag imported tag named GA - Event - Vimeo Tracking.
9. Change the {{YOUR_GA_TRACKING_ID}} in the **Tracking ID** field to your Google Analytics Tracking ID (a.k.a. UA Number).

Once you publish your next container, Vimeo tracking will begin working immediately.

**NOTE:** If you're using a custom GA cookie name, GA cookie domain, or GA function name, you'll need to change those variables as well.

#### Manual Installation (not recommended)

Create a new Custom HTML tag and paste in the below:

    <script type="text/javascript" id="gtm-vimeo-tracking">
      // script file contents go here
    </script>

In the space between the **&lt;script&gt;** and **&lt;/script&gt;** tags, paste in the contents of the lunametrics-vimeo.gtm.js script, found [here](https://raw.githubusercontent.com/lunametrics/vimeo-google-analytics/master/lunametrics-vimeo.gtm.js). Set the Firing Trigger to 'All Pages'. If you'd prefer to fire the tag only when a Vimeo video is detected, create the following variable:

Set the 'All Pages' Trigger on this new tag. If you'd like to prevent a potentially unnecessary call to load Vimeo's API, you can customize your trigger to only fire when a Vimeo video is detected on the page. Be aware that this might mess with tracking dynamically added videos.

**Don't forget, you need to add a Google Analytics Event tag that acts upon the pushes to the Data Layer the plugin executes.** Follow the steps in the [Google Tag Manager Configuration](#google-tag-manager-configuration) section for help on getting this set up.

## Configuration

### Default Configuration
By default, the script will attempt to fire events when users Play, Pause, Watch to End, and watch 10%, 25%, 50%, 75%, and 90% of each video on the page it is loaded into. These defaults can be adjusted by modifying the object passed as the third argument to the script, at the bottom.

### Player Interaction Events
By default, the script will fire events when users interact with the player by:

- Playing
- Pausing
- Watching to the end

To change which events are fired, edit the events property of the configuration at the end of the script. For example, if you'd like to not fire these events:

    (function( document, window, config) {
    
       // ... the tracking code

    })( document, window, {
      'events': {
        'Play': false,
        'Pause': false,
        'Watch to End': false,
      }
    });

The available events are **Play, Pause, and Watch to End**.

### Percentage Viewed Events

By default, the script will track 10%, 25%, 50%, 75%, and 90% view completion. You can adjust this by changing the percentages.each and percentages.every values. **Percentages are checked after each second of playtime** and are based on the actual percentage of the total video the user has watched.

#### percentages.each
For each number in the array passed to this configuration, a percentage viewed event will fire.

    (function(document, window, config) {
    
       // ... the tracking code

    })(document, window, {
      'percentages': {
        'every': [25]  // Tracks every 25% viewed
      }
    });

#### percentages.every
For every n%, where n is the value of percentages.every, a percentage viewed event will fire.

    (function(document, window, config) {
    
       // ... the tracking code

    })(document, window, {
      'percentages': {
        'each': [10, 90]  // Tracks when 10% of the video and 90% of the video has been viewed
      }
    });

**NOTE**: Google Analytics has a 500 hit per-session limitation, as well as a 20 hit window that replenishes at 2 hits per second. For that reason, it is HIGHLY INADVISABLE to track every 1% of video viewed.

### Using A Custom Data Layer Name or GA Global Name
If you're using a name for your dataLayer object other than 'dataLayer', you must configure the script to push the data into the correct place. Otherwise, it will try Universal Analytics directly, then Classic Analytics, and then fail silently.

		// Example: GTMs Data Layer was renamed from dataLayer to fooLayer
    (function(document, window, config) {
    
       // ... the tracking code

    })(document, window, {
			'syntax': {
				'type': 'gtm',
				'queueName': 'fooLayer'
			}
    });

		console.log(window.fooLayer);  
		> [{ event: 'vimeoTrack', 'attributes': { ... } }, ...]

		// Example: GA Global was renamed from 'ga' to 'fooTracker'
    (function(document, window, config) {
    
       // ... the tracking code

    })(document, window, {
			// For Universal Analytics Global
			'syntax': {
				'type': 'ua',
				'queueName': 'fooTracker'
			}
    });

		console.log(window.fooTracker.q);  
		> ['send', 'event', 'Videos', ...]
	

## Google Tag Manager Configuration

Once you've added the script to your container (see [Google Tag Manager Installation](#google-tag-manager-installation)), you must configure Google Tag Manager.

Create the following Variables:

* Variable Name: DLV - Video Name
    - Variable Type: Data Layer Variable
    - Data Layer Variable Name: attributes.videoName
    - This will be the name of the video according to Vimeo

* Variable Name: DLV - Video Action
    - Variable Type: Data Layer Variable
    - Data Layer Variable Name: attributes.videoAction
    - This will be the action the user has taken, e.g. Play, Pause, or Watch to End

Create the following Trigger:

* Trigger Name: Event - Vimeo Tracking
    - Trigger Type: Custom Event
    - Event Name: vimeoTrack

Create your Google Analytics Event tag

* Tag Name: GA - Event - Vimeo Tracking
    - Tag Type: Google Analytics
    - Choose a Tag Type: Universal Analytics (or Classic Analytics, if you are still using that)
    - Tracking ID: *&lt;Enter in your Google Analytics tracking ID&gt;*
    - Track Type: Event
    - Category: Videos
    - Action: {{DLV - Video Action}}
    - Label: {{DLV - Video URL}}
    - Fire On: More
        - Choose from existing Triggers: Event - Vimeo Tracking

## License

Licensed under the MIT License. For a complete copy of the license, please refer to the LICENSE.md file included with this repository.

## Acknowledgements

Created by the honest folks at [LunaMetrics](http://www.lunametrics.com/), a digital marketing & Google Analytics consultancy. For questions, please drop us a line here or [on our blog](http://www.lunametrics.com/blog/).

Written by [Dan Wilkerson](https://twitter.com/notdanwilkerson)
