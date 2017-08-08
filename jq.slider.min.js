/*
 * slider动画插件
 * by zhanghan
 * 2017-07-27
 *
 * ------------- html使用示例：--------------
 *  <div class="slider-box" id="sliderBox">
 *      <ul class="slider-list">
 *          <li class="slider-item"><img src="images/index_1.jpg" alt="1" /></li>
 *          <li class="slider-item"><img src="images/index_2.jpg" alt="2" /></li>
 *          <li class="slider-item"><img src="images/index_3.jpg" alt="3" /></li>
 *          <li class="slider-item"><img src="images/index_4.jpg" alt="4" /></li>
 *      </ul>
 *      <div class="slider-links"></div>
 *      <div class="slider-dots"></div>
 * </div>
 *
 *
 * -------------- js使用示例：---------------
 * $('.sliderBox').slider({
 *  isAutoRun:      true,        // 布尔值,默认为true      是否自动运行动画
 *  isHoverPause:   false,       // 布尔值,默认为false     是否鼠标移上去悬停动画
 *  isThough:       true,        // 布尔值,默认为true      动画是否穿透运行
 *  showArrow:      true,        // 布尔值,默认为true      是否显示左右箭头
 *  showDots:       false,       // 布尔值,默认为false     是否显示底部圆点
 *  dotsClass:      '',          // 字符串,默认为''        圆点区域样式名称
 *  className:      '',          // 字符串,默认为''        整体区域样式名称
 *  animateType:    'translate'  // 字符串,默认为'fade'    动画运行类型：有'fade'(淡入淡出)、'translate'(平移)、''(无)
 * });
 *
 */



;
(function($, window, document, undefined) {
    //定义Slider的构造函数
    var Slider = function(ele, opt) {
        this.$element = ele,
            this.defaults = {
                'isAutoRun': true,
                'isHoverPause': false,
                'isThough': true,
                'showArrow': true,
                'showDots': false,
                'dotsClass': '',
                'className': '',
                'animateType': 'translate'
            },
            options = $.extend({}, this.defaults, opt)
    }
    //定义Slider的方法
    Slider.prototype = {
        init: function() {
            // 全局变量
            timer = null;
            next = 1;
            active = 0;
            isPrevModel = false;
            ele = this.$element;
            $list = ele.find('.slider-list');
            $items = ele.find('.slider-item');
            itemsLen = $items.length - 1;

            // 初次加载动画
            $items.eq(0).addClass('active');

            this._dealError();
            this._dealParams();
            this._timerIsThough();
        },
        _dealError: function() {
            // 异常处理
            try {
                if (itemsLen <= 1) {
                    throw "slider-item图片列表长度至少为2";
                }
                if (!options.isAutoRun && !options.showArrow) {
                    throw "isAutoRun和showArrow参数必须有一个为true";
                }
                if (options.showArrow && ele.find('.slider-links').length <= 0) {
                    throw ".slider-links的元素没有找到"
                }
                if (options.showDots && ele.find('.slider-dots').length <= 0) {
                    throw ".slider-dots的元素没有找到"
                }
            } catch (err) {
                console.log('执行错误: ' + err);
            }
        },
        _dealParams: function() {
            var _this = this;
            // 添加slider自定义样式名称
            if (options.className && typeof options.className == 'string') {
                ele.addClass(options.className);
            }
            // 添加slider-dots自定义样式名称
            if (options.dotsClass && typeof options.dotsClass == 'string') {
                ele.find('.slider-dots').addClass(options.className);
            }

            // 鼠标悬停动画
            if (options.isHoverPause) {
                ele.find('.slider-item').hover(function() {
                    clearInterval(timer);
                }, function() {
                    _this._timerIsThough();
                });
            }

            // 显示左右箭头
            if (options.showArrow) {
                var arrow = '<div class="slider-link prev"></div><div class="slider-link next"></div>';
                ele.find('.slider-links').append(arrow);
                this._handleArrow();
            }

            // 显示底部圆点
            if (options.showDots) {
                var dots = '';
                for (var i = 0; i <= itemsLen; i++) {
                    dots += '<i></i>';
                }
                ele.find('.slider-dots').append(dots).find('i').eq(0).addClass('active');
                this._handleDots();
            }
        },
        animateTime: function(type, nextIndex) {
            var type = type || null;

            // 动画是否穿透最后一张图片
            if (!options.isThough) {
                if (next == 0) {
                    isPrevModel = false;
                } else if (next == itemsLen) {
                    isPrevModel = true;
                }
            }

            active = ele.find('.slider-item.active').index();
            next = (type == 'prev' || isPrevModel) ? active - 1 : Number(active) + 1;

            next = (nextIndex != null) ? nextIndex : next; // 如果有nextIndex索引参数,用于圆点随意切换
            next = (next > itemsLen) ? 0 : next;
            next = (next < 0) ? itemsLen : next;

            // 动画类型为fade
            if (options.animateType == 'fade') {
                ele.addClass('fade');
                $items.eq(next).animate({ opacity: 1 }, 1000, function() {
                    $(this).css('z-index', 2).addClass('active').siblings('.slider-item').css('z-index', 1).removeClass('active');
                }).end().eq(active).animate({ opacity: 0 }, 1000);
            } else if (options.animateType == 'translate') {
                ele.addClass('translate');
                $items.eq(next).addClass('active').siblings('.slider-item').removeClass('active');
                $list.css('right', (100 * next) + '%');
            }

            ele.find('.slider-dots i').removeClass('active').eq(next).addClass('active');


        },
        _timerIsThough: function() {
            // 是否自动运行
            if (options.isAutoRun) {
                timer = setInterval(this.animateTime, 6000);
            }

            // 动画不穿透，到最后一张图片后返回，到第一张后向前
            if (!options.isThough && next == itemsLen) {
                timer = setInterval(this.animateTime('prev'), 6000);
            }
        },
        _handleArrow: function() {
            var _this = this;
            // 上下箭头点击事件触发动画
            $('body').on('click', '.slider-link.prev', function() {
                    clearInterval(timer);
                    _this.animateTime('prev');
                    if (options.isAutoRun) {
                        timer = setInterval(_this.animateTime, 6000);
                    }
                })
                .on('click', '.slider-link.next', function() {
                    clearInterval(timer);
                    _this.animateTime('next');
                    if (options.isAutoRun) {
                        timer = setInterval(_this.animateTime, 6000);
                    }
                });
        },
        _handleDots: function() {
            var _this = this;
            // 左右圆点点击事件触发动画
            $('body').on('click', '.slider-dots i', function() {
                clearInterval(timer);
                _this.animateTime(null, $(this).index());
                if (options.isAutoRun) {
                    timer = setInterval(_this.animateTime, 6000);
                }
            });
        }
    }
    //在插件中使用Beautifier对象
    $.fn.Slider = function(options) {
        //创建Beautifier的实体
        var slider = new Slider(this, options);
        //调用其方法
        return slider.init();
    }
})(jQuery, window, document);