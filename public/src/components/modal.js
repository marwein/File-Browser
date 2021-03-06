var Vue = require('vue');
var $ = require('jquery');

module.exports = Vue.extend({
    template: '#modal-template',
    created: function() {
        var $el = this.$$el = $(this.$el).find('.modal');
        var modal = this.$modal = $el.modal().data('bs.modal');
        
        $el.on("hidden.bs.modal", function(){
          this.$parent.$el.focus();
          this.$destroy();
        }.bind(this))
    },
    methods: {
        remove: function(){
            this.$modal.hide();
        }
    }
});


var Modal = function(element, options) {
    this.options = options;
    this.$element = $(element).on("click.dismiss.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this));
    this.$backdrop = this.isShown = null;
    if (this.options.remote) this.$element.find(".modal-body").load(this.options.remote)
    return this;
};
Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
};
Modal.prototype.toggle = function() {
    return this[!this.isShown ? "show" : "hide"]()
};
Modal.prototype.show = function() {
    var that = this;
    var e = $.Event("show.bs.modal");
    this.$element.trigger(e);
    if (this.isShown || e.isDefaultPrevented()) return;
    this.isShown = true;
    this.escape();
    this.backdrop(function() {
        var transition = $.support.transition && that.$element.hasClass("fade");
        if (!that.$element.parent().length) {
            that.$element.appendTo(document.body)
        }
        that.$element.show();
        if (transition) {
            that.$element[0].offsetWidth
        }
        that.$element.addClass("in").attr("aria-hidden", false);
        that.enforceFocus();
        transition ? that.$element.one($.support.transition.end, function() {
            that.$element.focus().trigger("shown.bs.modal")
        }).emulateTransitionEnd(300) : that.$element.focus().trigger("shown.bs.modal")
    })
};
Modal.prototype.hide = function(e) {
    if (e) e.preventDefault();
    e = $.Event("hide.bs.modal");
    this.$element.trigger(e);
    if (!this.isShown || e.isDefaultPrevented()) return;
    this.isShown = false;
    this.escape();
    $(document).off("focusin.bs.modal");
    this.$element.removeClass("in").attr("aria-hidden", true);
    $.support.transition && this.$element.hasClass("fade") ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal()
};
Modal.prototype.enforceFocus = function() {
    $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function(e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
            this.$element.focus()
        }
    }, this))
};
Modal.prototype.escape = function() {
    if (this.isShown && this.options.keyboard) {
        this.$element.on("keyup.dismiss.bs.modal", $.proxy(function(e) {
            e.which == 27 && this.hide()
        }, this))
    } else if (!this.isShown) {
        this.$element.off("keyup.dismiss.bs.modal")
    }
};
Modal.prototype.hideModal = function() {
    var that = this;
    this.$element.hide();
    this.backdrop(function() {
        that.removeBackdrop();
        that.$element.trigger("hidden.bs.modal")
    })
};
Modal.prototype.removeBackdrop = function() {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null
};
Modal.prototype.backdrop = function(callback) {
    var that = this;
    var animate = this.$element.hasClass("fade") ? "fade" : "";
    if (this.isShown && this.options.backdrop) {
        var doAnimate = $.support.transition && animate;
        this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
        this.$element.on("click", $.proxy(function(e) {
            if (e.target !== e.currentTarget) return;
            this.options.backdrop == "static" ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this)
        }, this));
        if (doAnimate) this.$backdrop[0].offsetWidth;
        this.$backdrop.addClass("in");
        if (!callback) return;
        doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
    } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass("in");
        $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
    } else if (callback) {
        callback()
    }
};
var old = $.fn.modal;
$.fn.modal = function(option) {
    return this.each(function() {
        var $this = $(this);
        var data = $this.data("bs.modal");
        var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == "object" && option);
        if (!data) $this.data("bs.modal", data = new Modal(this, options));
        if (typeof option == "string") data[option]();
        else if (options.show) data.show()
    })
};
$.fn.modal.Constructor = Modal;
$.fn.modal.noConflict = function() {
    $.fn.modal = old;
    return this
};
$(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
    var $this = $(this);
    var href = $this.attr("href");
    var $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, ""));
    var option = $target.data("modal") ? "toggle" : $.extend({
        remote: !/#/.test(href) && href
    }, $target.data(), $this.data());
    e.preventDefault();
    $target.modal(option).one("hide", function() {
        $this.is(":visible") && $this.focus()
    })
});
$(function() {
    var $body = $(document.body).on("shown.bs.modal", ".modal", function() {
        $body.addClass("modal-open")
    }).on("hidden.bs.modal", ".modal", function() {
        $body.removeClass("modal-open")
    })
});