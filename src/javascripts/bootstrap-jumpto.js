/**
 * @author Jay <jwang@dizsoft.com>
 */

(function ($) {
    'use strict';
    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    $.extend($.fn.bootstrapTable.defaults, {
        showJumpto: false,
        exportOptions: {}
    });

    $.extend($.fn.bootstrapTable.locales, {
        formatJumpto: function () {
            return 'GO';
        }
    });
    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initPagination = BootstrapTable.prototype.initPagination;

    BootstrapTable.prototype.initPagination = function () {
        _initPagination.apply(this, Array.prototype.slice.apply(arguments));

        if (this.options.showJumpto) {
            var that = this,
                $pageGroup = this.$pagination.find('ul.pagination'),
                $jumpto = $pageGroup.find('li.jumpto');

            if (!$jumpto.length) {
                $jumpto = $([
                    '<li class="jumpto">',
                        '跳至 <input class="Pagejumpto" type="text" class="form-control"> 页',
                    '</li>'].join('')).appendTo($pageGroup);
                    //'<button class="btn' +
                //     sprintf(' btn-%s', this.options.buttonsClass) +
                //     sprintf(' btn-%s', this.options.iconSize) +
                //     '" title="' + this.options.formatJumpto() + '" ' +
                //     ' type="button">'+this.options.formatJumpto(),
                // '</button>',
                // $jumpto.find('button').click(function () {
                //     that.selectPage(parseInt($jumpto.find('input').val()));
                // });
                $(".Pagejumpto").bind("keydown",function(e){
                    var key = e.which;
                    if(key == 13){
                        //在这里写你的代码
                        that.selectPage(parseInt($jumpto.find('input').val()));
                    }
                })
            }
        }
    };
})(jQuery);
