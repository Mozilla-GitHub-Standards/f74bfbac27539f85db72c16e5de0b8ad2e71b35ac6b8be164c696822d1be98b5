/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Raindrop.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * */

/*jslint indent: 2, */
/*global define: false, document: false */
"use strict";

define([ 'blade/object', 'blade/Widget', 'blade/array', 'jquery', 'module',
         'text!./Select.html', 'text!./Select.css'],
function (object,         Widget,         array,         $,        module,
          template, css) {

  var className = module.id.replace(/\//g, '-'),
      style = document.createElement('style'),
      openSelect;

  //Add the css to that page.
  style.type = 'text/css';
  //If class name is changed since this is an anonymous module, update the
  //CSS classes.
  if (className !== 'Select') {
    css = css.replace(/\.Select/g, '.' + className);
  }
  style.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(style);

  //Set up event handlers.
  $(function () {
    $('body')
      .delegate('.' + className, 'change', function (evt) {
        Widget.closest(module.id, evt, 'onChange');
      })
      .delegate('.' + className + ' .triangle', 'click', function (evt) {
        Widget.closest(module.id, evt, 'onTriangleClick');
        evt.preventDefault();
        evt.stopPropagation();
      })
      .delegate('.' + className + ' li', 'click', function (evt) {
        Widget.closest(module.id, evt, 'onOptionClick');
        evt.preventDefault();
        evt.stopPropagation();
      });

    $(document).bind('click', function (evt) {
      if (openSelect) {
        openSelect.close();
      }
    });
  });


  /**
   * Define the widget.
   * This widget assumes its member variables include the following
   * properties (passed in on create of the widget)
   *
   * @param {Array} options: the options to show, with each option being
   * an object with "name" and "value" properties.
   * @param {String} name: the name to use for the form field.
   * @param {Number} selectedIndex: the index of the options that should
   * be selected.
   */
  return object(Widget, null, function (parent) {
    return {
      moduleId: module.id,
      className: className,

      template: template,

      onCreate: function () {
        this.selectedIndex = this.selectedIndex || 0;
        this.value = this.options[this.selectedIndex].value;
      },

      onRender: function () {
        this.dom = $(this.node);

        //Apply selected style.
        $('li', this.node).eq(this.selectedIndex).addClass('selected');
      },

      destroy: function () {
        delete this.dom;
        parent(this, "destroy", arguments);
      },

      close: function () {
        var liNode = $('li.selected', this.node)[0];

        // Put the value in the hidden input
        $('input', this.node).val(liNode.getAttribute('data-value'));

        // Remove the open class.
        this.dom.removeClass('open');

        // Update the list to be positioned correctly to show the selection.
        this.node.scrollTop = this.selectedIndex * liNode.getBoundingClientRect().height;

        //Position the triangle correctly.
        $('.triangle', this.node)[0].style.top = this.node.scrollTop + 'px';
      },

      open: function () {
        if (openSelect) {
          openSelect.close();
        }
        this.dom.addClass('open');
        openSelect = this;
      },

      onTriangleClick: function (evt) {
        this.open();
      },

      onOptionClick: function (evt) {
        // Open the options if not already open.
        if (!this.dom.hasClass('open')) {
          this.open();
          return;
        }

        var liNode = evt.target,
            ulNode = liNode.parentNode;

        // Find the index.
        this.selectedIndex = array.to.apply(null, $('li', ulNode)).indexOf(liNode);

        // Make sure the right node has the selected class
        $('li', ulNode).removeClass('selected');
        $(liNode).addClass('selected');

        this.close();
      }
    };
  });

});
