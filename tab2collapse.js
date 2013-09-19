/**
 * Tab2Collapse jQuery Plugin
 * "Because sometimes, Tabs have to be collapsible"
 *
 * Brought to you by Les Polypodes (Nantes, France)
 *
 * @overview Tab2collapse jQuery Plugin
 * @copyright Copyright (c) 2013 Les Polypodes
 * @version 1.0.0
 * @license MIT
 * @summary Transforms your (Bootstrap3) Tabs into collapsible accordions
 * @link https://github.com/polypodes/Tab2Collapse
 * @requires MustacheJs
 * @see https://github.com/janl/mustache.js/
 * @see http://getbootstrap.com/javascript/#collapse
 * @see https://github.com/simonwade/tabcordion (inspiration)
 * @author Ronan <ronan@lespolypodes.com>
 * @example
 *   // Call mustacheJs script
 *   // then insert a <div id="myTab"></div>
 *   // then call tab2collapse:
 *   $('#myTab').tab2collapse({ breakWidth: 500 });
 *
 */

(function() {
    var Tab2collapse;

    /**
     * Adding tab2collapse to jQuery's function list
     *
     * @param {obj} options - tab2collapse options
     */
    $.fn.tab2collapse = function(option) {
        return this.each(function() {
            var $this, data, options;
            $this = $(this);
            options = typeof option === 'object' && option;
            if(options.breakWidth > $(document).width()){ // Size matters.
                data = $this.data('tab2collapse') || new Tab2collapse(this, options);
            }
        });
    };

    /**
     * jQuery Tab2collapse plugin
     */
    Tab2collapse = (function() {

        /**
         * Tab2collapse MustacheJs templates
         * to use for rendering Bootstrap 3.0.0 collapsible accordions
         * Note the triple mustache to render unescaped HTML inputs
         *
         * @see http://getbootstrap.com/javascript/#collapse
         * @see https://github.com/janl/mustache.js/
         */
        Tab2collapse.prototype.getTemplates = function() {

            var templates = {};

            // heading tpl expects "target" (such as '#foo') & "title"
            templates.heading = '<div class="panel-heading"><h4 class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="{{ target }}">{{{ title }}}</a></h4></div>';

            // content tpl expects "id" (such as '#foo') & "content"
            templates.content = '<div id="{{ id }}" class="panel-collapse collapse"><div class="panel-body">{{{ content }}}</div></div>';

            return templates;

        };

        /**
         * Tab2collapse jQuery plugin ctor.
         *
         * @constructor
         * @param {element} el - HTML element
         * @param {obj} options - Tab2collapse options
         */
        function Tab2collapse(el, options) {

            var data = {},
                html = { heads: [], bodies: []},
                templates = this.getTemplates();

            this.$el = $(el);

            // TODO: change this from hardcoded selectors to input entries (accessible via this.options)
            data.titles = this.$el.find('> ul.nav-tabs li a');
            data.contents = this.$el.find('> div.tab-content section.tab-pane');

            if(data.titles.length != data.contents.length) {
                return; // Please RTFM & check your DOM.
            }

            // Fetching data from default, large-screens DOM
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

            //  Revamping tiny screens DOM
            this.$el.empty();
            for(var i=0;i<data.titles.length;i++){

                this.$el.append(html.heads[i]);
                this.$el.append(html.bodies[i]);

            }
        }

    return Tab2collapse;

  })();

}).call(this);
