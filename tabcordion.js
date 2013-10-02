/**
 * Tabcordion jQuery Plugin
 * "Because sometimes, Tabs have to be collapsible"
 *
 * Brought to you by Les Polypodes (Nantes, France)
 *
 * Disclaimer:
 * This plugin assumes you default DOM already contains *tabs*
 *
 * @overview Tabcordion jQuery Plugin
 * @copyright Copyright (c) 2013 Les Polypodes
 * @version 1.0.0
 * @license MIT
 * @summary Transforms your (Bootstrap3) Tabs into collapsible accordions
 * @link https://github.com/polypodes/Tabcordion
 * @requires MustacheJs
 * @see https://github.com/janl/mustache.js/
 * @see http://getbootstrap.com/javascript/#collapse
 * @see https://github.com/simonwade/tabcordion (inspiration)
 * @author Ronan <ronan@lespolypodes.com>, Gaëtan <gaetan@lespolypodes.com>
 * @example
 *   // Call mustacheJs script
 *   // then insert a <div id="myTab"></div>
 *   // then call tabcordion:
 *   $('#myTab').tabcordion({ breakWidth: 500 });
 *
 */

(function() {
    var Tabcordion;

    /**
     * Adding tabcordion to jQuery's function list
     *
     * @param {obj} options - tabcordion options
     */
    $.fn.tabcordion = function(options) {
        return this.each(function() {
            var $this, data;
            $this = $(this);
            if('object' != typeof options) {
                return; // Please give me an {} and nothing else.
            }
            data = $this.data('tabcordion') || new Tabcordion(this, options);
        });
    };

    /**
     * default Tabcordion options
     */
    $.fn.tabcordion.defaults = {
        resizeEl: null,
        onResize: true,
        delay: 500,
        breakWidth: 500,
        tabs: {
            panelTitleTag: 'h4'
        },
        accordion: {
            elementId: 'accordion'
        },
        scheduler: null
    };

    /**
     * Tabcordion between tabs & collapse
     */
    Tabcordion = (function() {

        /**
         * Tabcordion jQuery plugin ctor.
         *
         * @constructor
         * @param {element} el - HTML element
         * @param {obj} options - parameters collection object
         */
        function Tabcordion(el, options)
        {
            this.el = el;
            this.$el = $(el);
            this.options = $.extend({}, $.fn.tabcordion.defaults, {
                resizeEl: this.$el
            }, options);
            if (this.options.onResize) {
                this.proxy = $.proxy(this.eventHandler, this);
                $(window).on('resize', this.proxy);
            }
            this.onResize();
        }

        /**
         * Tabcordion MustacheJs templates
         * to use for rendering Bootstrap 3.0.0 collapsible accordions
         * Note the triple mustache to render unescaped HTML inputs
         *
         * @see http://getbootstrap.com/javascript/#collapse
         * @see https://github.com/janl/mustache.js/
         */
        Tabcordion.prototype.getTemplates = function() {

            var templates = {};

            // heading tpl expects "target" (such as '#foo') & "title"
            templates.heading = '<div class="panel-heading"><' + this.options.tabs.panelTitleTag + ' class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent="#' + this.options.accordion.elementId + '" href="{{ target }}_accordion">{{{ title }}}</a></'+ this.options.tabs.panelTitleTag + '></div>';

            // content tpl expects "id" (such as '#foo') & "content"
            templates.content = '<div id="{{ id }}_accordion" class="panel-collapse collapse"><div class="panel-body">{{{ content }}}</div></div>';

            templates.containerStart = '<div class="panel-group" id="accordion">';
            templates.containerItemStart = '<div class="panel panel-default">';
            templates.containerItemEnd = '</div>';
            templates.containerEnd = '</div>';

            return templates;

        };

        /**
         * collapse2tab
         * Show the tab & hide the collapsible accordion if exists
         * Assumes tabs always exist.
         *
         * @param {element} el - HTML element
         * @param {obj} options - parameters collection object
         */
        Tabcordion.prototype.collapse2tab = function()
        {
            // Duplicate DOM is bad. It is known.
            this.$el.find(' > #' + this.options.accordion.elementId).remove();

            this.$el.find(' > .nav-tabs').show();
            this.$el.find(' > .tab-content').show();
        };

        /**
         * tabcordion
         * Build the collapsible accordion, if not exists,
         * & hide the tabs.
         * Assumes tabs always exist.
         */
        Tabcordion.prototype.tab2collapse = function()
        {
            //  Hiding tabs, then build or just re-showing the collapsible accordion
            this.$el.find(' > .nav-tabs').hide();
            this.$el.find(' > .tab-content').hide();

            if(0 === this.$el.find('#accordion').length){

                var data = {},
                    html = { heads: [], bodies: []},
                    templates = this.getTemplates(),
                    output = '';

                // Fetching data from tabs (large-screens) DOM elements
                data.titles = this.$el.find('> .nav-tabs li a');
                data.contents = this.$el.find('> .tab-content .tab-pane');

                if(data.titles.length != data.contents.length) {
                    return; // Please RTFM & check your DOM.
                }

                // Revamping the DOM for tiny-width screens
                for(var i=0;i<data.titles.length;i++){

                    var head = {},
                        body = {};

                    head.target = $(data.titles[i]).attr('href');
                    head.title = $(data.titles[i]).html();
                    html.heads[i] = Mustache.render(templates.heading, head);

                    body.id = $(data.contents[i]).attr('id');
                    body.content = $(data.contents[i]).html();
                    html.bodies[i] = Mustache.render(templates.content, body);
                }

                output += templates.containerStart;
                for(var i=0;i<data.titles.length;i++){
                    output += templates.containerItemStart;
                    output += html.heads[i];
                    output += html.bodies[i];
                    output += templates.containerItemEnd;
                }
                output += templates.containerEnd;
                // Stupid trick to mislead jQuery selectors overs duplicated IDs
                this.$el.prepend(output);
            } else {
                // Revealing headers only (collapsed)
               this.$el.find(' >.panel-group .panel .panel-heading').show();
            }
        }

        /**
         * eventHandler
         * @param {event} e - an event
         */
        Tabcordion.prototype.eventHandler = function(e) {
            var _this = this;
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            return this.timeout = setTimeout(function() {
                if (_this.options.scheduler) {
                    return _this.options.scheduler(function() {
                        return _this.onResize(e);
                    });
                } else {
                    return _this.onResize(e);
                }
            }, this.options.delay);
        };

        /**
         * onResize
         */
        Tabcordion.prototype.onResize = function() {
            if(this.options.breakWidth > $(document).width()){ // Size matters.
                this.tab2collapse()
            }
            else {
                this.collapse2tab();
            }
        };

        return Tabcordion;

    })();

}).call(this);
