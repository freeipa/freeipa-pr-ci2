/*jsl:import ipa.js */

/*  Authors:
 *    Pavel Zuna <pzuna@redhat.com>
 *    Adam Young <ayoung@redhat.com>
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

IPA.entity_factories.user = function() {

    return IPA.entity({
        name: 'user'
    }).
        facet(
            IPA.search_facet().
                column({name:'cn'}).
                column({name:'uid'}).
                column({name:'uidnumber'}).
                column({name:'mail'}).
                column({name:'telephonenumber'}).
                column({name:'title'}).
                dialog(
                    IPA.add_dialog({
                        'name': 'add',
                        'title': IPA.messages.objects.user.add
                    }).
                        field(IPA.text_widget({ name: 'uid', undo: false })).
                        field(IPA.text_widget({ name: 'givenname', undo: false })).
                        field(IPA.text_widget({ name: 'sn', undo: false })))).
        facet(IPA.details_facet().
            section(
                IPA.stanza({name: 'identity', label: IPA.messages.details.identity}).
                    input({name:'title'}).
                    input({name:'givenname'}).
                    input({name:'sn'}).
                    input({name:'cn'}).
                    input({name:'displayname'}).
                    input({name:'initials'})).
            section(
                IPA.stanza({name: 'account', label: IPA.messages.objects.user.account}).
                    custom_input(IPA.user_status_widget({name:'nsaccountlock'})).
                    input({name:'uid'}).
                    custom_input(IPA.user_password_widget({name:'userpassword'})).
                    input({name:'uidnumber'}).
                    input({name:'gidnumber'}).
                    input({name:'loginshell'}).
                    input({name:'homedirectory'})).
            section(
                IPA.stanza({name: 'contact', label: IPA.messages.objects.user.contact}).
                    multivalued_text({name:'mail'}).
                    multivalued_text({name:'telephonenumber'}).
                    multivalued_text({name:'pager'}).
                    multivalued_text({name:'mobile'}).
                    multivalued_text({name:'facsimiletelephonenumber'})).
            section(
                IPA.stanza({name: 'mailing', label: IPA.messages.objects.user.mailing}).
                    input({name:'street'}).
                    input({name:'l'}).
                    input({name:'st'}).
                    input({name:'postalcode'})).
            section(
                IPA.stanza({name: 'employee', label: IPA.messages.objects.user.employee}).
                    input({name:'ou'}).
                    input({name:'manager'})).
            section(
                IPA.stanza({name: 'misc', label: IPA.messages.objects.user.misc}).
                    input({name:'carlicense'}))).
        facet(
            IPA.association_facet({
                name: 'memberof_group',
                associator: IPA.serial_associator
            })).
        facet(
            IPA.association_facet({
                name: 'memberof_netgroup',
                associator: IPA.serial_associator
            })).
        facet(
            IPA.association_facet({
                name: 'memberof_role',
                associator: IPA.serial_associator
            })).
        standard_associations();
};

/* ATTRIBUTE CALLBACKS */


IPA.user_status_widget = function(spec) {

    spec = spec || {};

    var that = IPA.widget(spec);

    that.update = function() {

        if (!that.record) return;

        that.container.empty();

        var lock_field = 'nsaccountlock';

        var locked  = that.record[lock_field] &&
            that.record[lock_field][0].toLowerCase() === 'true';
        var title = IPA.messages.objects.user.active;
        var text = title+":  "+IPA.messages.objects.user.deactivate;
        if (locked) {
            title = IPA.messages.objects.user.inactive;
            text = title+":  "+IPA.messages.objects.user.activate;
        }

        function on_lock_win(data, textStatus, xhr){
            var entity = IPA.get_entity(that.entity_name);
            var facet = entity.get_facet('details');
            facet.refresh();
            return false;
        }

        function on_lock_fail(data, textStatus, xhr){
            $("#userstatuslink").text = IPA.messages.objects.user.error_changing_status;
            return false;
        }

        var status_field =
            $('<a/>',
              {
                  id: 'userstatuslink',
                  title: title,
                  href: "jslink",
                  text: text,
                  click: function() {
                      var jobj = $(this);
                      var val = jobj.attr('title');
                      var pkey =  $.bbq.getState('user-pkey');
                      var command = 'user_enable';
                      if (val == IPA.messages.objects.user.active) {
                          command = 'user_disable';
                      }
                      IPA.cmd(command, [pkey], {}, on_lock_win,on_lock_fail);

                      return (false);
                  }
              });
        status_field.appendTo(that.container);
    };

    return that;
};

IPA.user_password_widget = function(spec) {

    spec = spec || {};

    var that = IPA.widget(spec);

    that.create = function(container) {
        $('<a/>', {
            href: 'jslink',
            title: 'userpassword',
            text: IPA.messages.objects.user.reset_password,
            click: resetpwd_on_click
        }).appendTo(container);
    };

    function resetpwd_on_click() {

        function reset_password(new_password) {

            var user_pkey = $.bbq.getState('user-pkey');
            var pw_pkey;
            if (user_pkey === IPA.whoami.uid[0]){
                pw_pkey = [];
            }else{
                pw_pkey = [user_pkey];
            }

            IPA.cmd('passwd',
                    pw_pkey, {"password":new_password},
                    function(){
                        alert(IPA.messages.objects.user.password_change_complete);
                        dialog.dialog("close");
                    },
                    function(){});
        }

        var dialog =
            $('<div ><dl class="modal">'+
              '<dt>'+IPA.messages.objects.user.new_password+'</dt>'+
              '<dd class="first" ><input id="password_1" type="password"/></dd>'+
              '<dt>'+IPA.messages.objects.user.repeat_password+'</dt>'+
              '<dd class="first"><input id="password_2" type="password"/></dd>'+
              '</dl></div>');

        dialog.dialog({
            modal: true,
            minWidth:400,
            buttons: {
                'Reset Password': function(){
                     var p1 = $("#password_1").val();
                     var p2 = $("#password_2").val();
                     if (p1 != p2){
                          alert(IPA.messages.objects.user.password_must_match);
                          return;
                     }
                     reset_password(p1);
                },
                'Cancel':function(){
                     dialog.dialog('close');
                }
            }
        });

        return false;
    }

    return that;
};
