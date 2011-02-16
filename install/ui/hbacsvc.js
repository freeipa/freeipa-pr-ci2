/*jsl:import ipa.js */

/*  Authors:
 *    Endi Sukma Dewata <edewata@redhat.com>
 *
 * Copyright (C) 2010 Red Hat
 * see file 'COPYING' for use and warranty information
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* REQUIRES: ipa.js, details.js, search.js, add.js, entity.js */

IPA.entity_factories.hbacsvc = function () {

    var that = IPA.entity({
        'name': 'hbacsvc'
    });

    that.init = function() {

        var facet = IPA.hbacsvc_search_facet({
            'name': 'search',
            'label': IPA.messages.facets.search
        });

        var dialog = IPA.hbacsvc_add_dialog({
            'name': 'add',
            'title': IPA.messages.objects.hbacsvc.add
        });
        facet.dialog(dialog);

        that.add_facet(facet);

        facet = IPA.hbacsvc_details_facet({
            'name': 'details'
        });
        that.add_facet(facet);

        that.entity_init();
    };

    return that;
};



IPA.hbacsvc_add_dialog = function (spec) {

    spec = spec || {};

    var that = IPA.add_dialog(spec);

    that.init = function() {

        that.add_field(IPA.text_widget({name:'cn', undo: false}));
        that.add_field(IPA.text_widget({name:'description', undo: false}));

        that.add_dialog_init();
    };

    return that;
};


IPA.hbacsvc_search_facet = function (spec) {

    spec = spec || {};

    var that = IPA.search_facet(spec);

    that.init = function() {

        that.create_column({name:'cn', primary_key: true});
        that.create_column({name:'description'});

        that.search_facet_init();
    };

    return that;
};


IPA.hbacsvc_details_facet = function (spec) {

    spec = spec || {};

    var that = IPA.details_facet(spec);

    that.init = function() {

        var section = IPA.details_list_section({
            'name': 'general',
            'label': IPA.messages.details.general
        });
        that.add_section(section);

        section.text({name: 'cn'});
        section.text({name: 'description'});

        that.details_facet_init();
    };

    return that;
};
