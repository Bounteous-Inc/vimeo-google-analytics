;(function(document, window, config) {

  'use strict';
  // The API won't work on LT IE9, so we bail if we detect those UAs
  if (navigator.userAgent.match(/MSIE [678]\./gi)) return;

  config = cleanConfig(config);

  var handle = getHandler(config.syntax);

  if (document.readyState !== 'loading') {

    init();

  } else {

    document.addEventListener('DOMContentLoaded', function() {

      init();
      document.addEventListener('load', init, true);

    });

  }

  function init() {

    var videos = filter_(selectAllTags_('iframe'), isVimeo);

    if (!videos.length) return;

    loadApi(function() {

      forEach_(videos, listenTo);

    });

  }

  function isVimeo(el) {

    return el.src.indexOf('player.vimeo.com/video/') > -1;

  }

  function loadApi(callback) {

    if (isUndefined_(window.Vimeo)) {

      loadScript('https://player.vimeo.com/api/player.js', callback);

    } else {

      callback();

    }

  }

  function listenTo(el) {

    if (el.__vimeoTracked) return;

    el.__vimeoTracked = true;

    var video = new Vimeo.Player(el);
    var percentages = config._track.percentages;
    var eventNameDict = {
			'Play': 'play',
			'Pause': 'pause',
			'Watch to End': 'ended'
		};
    var cache = {};

    video.getVideoTitle()
      .then(function(title) {

				forEach_(['Play', 'Pause', 'Watch to End'], function(key) {

					if (config.events[key]) {

						video.on(eventNameDict[key], function() {

							handle(key, title);

						});

					}

				});

				if (percentages) {

	        video.on('timeupdate', function(evt) {

	          var percentage = evt.percent;
	          var key;

	          for (key in percentages) {

	            if (percentage >= percentages[key] && !cache[key]) {

	              cache[key] = true;
	              handle(key, title);

	            }

	          }

	        });

				}

      });

  }

  function cleanConfig(config) {

    config = extend_({}, {
      events: {
        'Play': true,
        'Pause': true,
        'Watch to End': true
      },
      percentages: {
        each: [],
        every: []
     }
    }, config);

    forEach_(['each', 'every'], function(setting) {

      var vals = config.percentages[setting];

      if (!isArray_(vals)) vals = [vals];

      if (vals) config.percentages[setting] = map_(vals, Number);

    });

    var points = [].concat(config.percentages.each);

    if (config.percentages.every) {

      forEach_(config.percentages.every, function(val) {

        var n = 100 / val;
        var every = [];
        var i;

        for (i = 1; i < n; i++) every.push(val * i);

        points = points.concat(filter_(every, function(val) {

          return val > 0.0 && val < 100.0;

        }));

      });

    }

    var percentages = reduce_(points, function(prev, curr) {

      prev[curr + '%'] = curr / 100.0;
      return prev;

    }, {});

    config._track = {
      percentages: percentages
    };

    return config;

  }

  function getHandler(syntax) {

    syntax = syntax || {};

    var gtmGlobal = syntax.name || 'dataLayer';
    var uaGlobal = syntax.name || window.GoogleAnalyticsObject || 'ga';
    var clGlobal = '_gaq';
    var dataLayer;

    var handlers = {
      'gtm': function(state, title) {

        dataLayer.push({
          event: 'vimeoTrack',
          attributes: {
            videoAction: state,
            videoName: title
          }
        });

      },
      'cl': function(state, title) {

        window[clGlobal].push(['_trackEvent', 'Videos', state, title]);

      },
      'ua': function(state, title) {

        window[uaGlobal]('send', 'event', 'Videos', state, title);

      }
    };

    switch(syntax.type) {

      case 'gtm':

        dataLayer = window[gtmGlobal] = window[gtmGlobal] || [];
        break;

      case 'ua':

        window[uaGlobal] = window[uaGlobal] || function() {

          (window[uaGlobal].q = window[uaGlobal].q || []).push(arguments);

        };
        window[uaGlobal].l = +new Date();
        break;

      case 'cl':

        window[clGlobal] = window[clGlobal] || [];
        break;

      default:

        if (!isUndefined_(window[gtmGlobal])) {

          syntax.type = 'gtm';
          dataLayer = window[gtmGlobal] = window[gtmGlobal] || [];

        } else if (uaGlobal&& !isUndefined_(window[uaGlobal])) {

          syntax.type = 'ua';

        } else if (!isUndefined_(window[clGlobal]) && !isUndefined_(window[clGlobal].push)) {

          syntax.type = 'cl';

        }
        break;
    }

    return handlers[syntax.type];

  }

  function extend_() {

    var args = [].slice.call(arguments);
    var dst = args.shift();
    var src;
    var key;
    var i;

    for (i = 0; i < args.length; i++) {

      src = args[i];

      for (key in src) {

        dst[key] = src[key];

      }

    }

    return dst;

  }

  function isArray_(o) {

    if (Array.isArray_) return Array.isArray_(o);

    return Object.prototype.toString.call(o) === '[object Array]';

  }

  function forEach_(arr, fn) {

    if (Array.prototype.forEach_) return arr.forEach.call(arr, fn);

    var i;

    for (i = 0; i < arr.length; i++) {

      fn.call(window, arr[i], i, arr);

    }

  }

  function map_(arr, fn) {

    if (Array.prototype.map_) return arr.map.call(arr, fn);

    var newArr = [];

    forEach_(arr, function(el, ind, arr) {

      newArr.push(fn.call(window, el, ind, arr));

    });

    return newArr;

  }


  function filter_(arr, fn) {

    if (Array.prototype.filter) return arr.filter.call(arr, fn);

    var newArr = [];

    forEach_(arr, function(el, ind, arr) {

      if (fn.call(window, el, ind, arr)) newArr.push(el);

    });

    return newArr;

  }

  function reduce_(arr, fn, init) {

    if (Array.prototype.reduce) return arr.reduce.call(arr, fn, init);

    var result = init;
    var el;
    var i;

    for (i = 0; i < arr.length; i++) {

      el = arr[i];
      result = fn.call(window, result, el, arr, i);

    }

    return result;

  }

  function isUndefined_(thing) {

    return typeof thing === 'undefined';

  }

  function selectAllTags_(tags) {

    if (!isArray_(tags)) tags = [tags];

    return [].slice.call(document.querySelectorAll(tags.join()));

  }

  function loadScript(src, callback) {

    var f, s;

    f = document.getElementsByTagName('script')[0];
    s = document.createElement('script');
    s.onload = callCallback;
    s.src = src;
    s.async = true;

    f.parentNode.insertBefore(s, f);

    function callCallback() {

      if (callback) {

        callback();
        s.onload = null;

      }

    }

  }

})(document, window, {
  'events': {
    'Play': true,
    'Pause': true,
    'Watch to End': true
  },
  'percentages': {
    'every': 25,
    'each': [10, 90]
  }
});
/*
 * Configuration Details
 *
 * @property events object
 * Defines which events emitted by YouTube API
 * will be turned into Google Analytics or GTM events
 *
 * @property percentages object
 * Object with configurations for percentage viewed events
 *
 *   @property each Array|Number|String
 *   Fires an event once each percentage ahs been reached
 *
 *   @property every Array|Number|String
 *   Fires an event for every n% viewed
 *
 * @property syntax object
 * Object with configurations for syntax
 *
 *   @property type ('gtm'|'cl'|'ua')
 *   Forces script to use GTM ('gtm'), Universal Analytics ('ul'), or
 *   Classic Analytics ('cl'); defaults to auto-detection
 *
 *   @property name string
 *   THIS IS USUALLY UNNECESSARY! Optionally instantiate command queue for syntax
 *   in question. Useful if the tracking library and tracked events can fire
 *   before GTM or Google Analytics can be loaded. Be careful with this setting
 *   if you're new to GA/GTM. GTM or Universal Analytics Only!
 */
/*
 * v1.0.1
 * Created by the Google Analytics consultants at http://www.lunametrics.com
 * Written by @notdanwilkerson
 * Documentation: https://github.com/lunametrics/vimeo-google-analytics/
 * Licensed under the MIT License
 */
