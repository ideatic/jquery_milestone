(function($) {

    /**
     * Detect element scroll into view by
     * http://www.benknowscode.com/2013/07/detect-dom-element-scrolled-with-jquery.html
     */

    var $window = $(window),
            _watch = [],
            _buffer;

    function test($el) {
        var docViewTop = $window.scrollTop(),
                docViewBottom = docViewTop + $window.height(),
                elemTop = $el.offset().top,
                elemBottom = elemTop + $el.height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
                && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    $window.on('scroll', function(e) {

        if (!_buffer) {

            _buffer = setTimeout(function() {

                checkInView(e);

                _buffer = null;

            }, 300);
        }

    });

    function checkInView(e) {

        $.each(_watch, function() {

            if (test(this.element)) {
                if (!this.invp) {
                    this.invp = true;
                    if (this.options.scrolledin)
                        this.options.scrolledin.call(this.element, e);

                    this.element.trigger('scrolledin', e);
                }
            } else if (this.invp) {
                this.invp = false;
                if (this.options.scrolledout)
                    this.options.scrolledout.call(this.element, e);

                this.element.trigger('scrolledout', e);
            }
        });
    }

    function monitor(element, options) {
        var item = {element: element, options: options, invp: false};
        _watch.push(item);

        if (test(element)) {
            element.trigger('scrolledin');
        }

        return item;
    }

    function unmonitor(item) {
        for (var i = 0; i < _watch.length; i++) {
            if (_watch[i] === item) {
                _watch.splice(i, 1);
                item.element = null;
                break;
            }
        }
    }

    var pluginName = 'scrolledIntoView',
            settings = {
                scrolledin: null,
                scrolledout: null
            }


    $.fn[pluginName] = function(options) {

        var options = $.extend({}, settings, options);

        this.each(function() {

            var $el = $(this),
                    instance = $.data(this, pluginName);

            if (instance) {
                instance.options = options;
            } else {
                $.data(this, pluginName, monitor($el, options));
                $el.on('remove', $.proxy(function() {

                    $.removeData(this, pluginName);
                    unmonitor(instance);

                }, this));
            }
        });

        return this;
    }
})(jQuery);

(function($) {
    var pluginName = 'milestone',
            settings = {
            }


    $.fn[pluginName] = function(options) {

        var options = $.extend({}, settings, options);

        this.each(function() {

            var $el = $(this);

            //Initialize markup
            var s = $el.text();

            var divs = [];
            for (var i = 0; i < s.length; i++) {
                var char = s.charAt(i);
                $el.css('display','inline-block').text(char);
                var $div = $('<div></div>').css({
                    position: 'relative',
                    float: 'left',
                    overflow: 'hidden',
                    width: ($el.width()+1) + 'px',
                    height: $el.height() + 'px',
                    top: '5px',
                    lineHeight: $el.height() + 'px',
                });

                if (/\d+/.test(char)) {
                    var $ul = $('<ul></ul>').appendTo($div).css({
                        position: 'absolute',
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                    });

                    for (var j = 0; j <= char; j++) {
                        $('<li>' + j + '</li>').appendTo($ul);
                    }
                } else {
                    $div.text(char);
                }

                divs.push($div);
            }
            $el.empty().append(divs);

            //Hide elements until scrolled into view
            $('ul', $el).each(function() {
                $(this)
                        .css('bottom', '-' + $(this).height() + 'px')
            });


            //Animate when scrolled into view
            $el.bind('scrolledin', function() {
                $el.unbind('scrolledin');
                $('ul', $el).each(function() {
                    $(this).animate({bottom: '5px'}, 800)
                            .animate({bottom: '0px'}, 'slow');
                });
            }).scrolledIntoView();
        });

        return this;
    }
})(jQuery);