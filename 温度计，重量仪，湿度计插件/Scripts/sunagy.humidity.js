(function ($) {
    $.fn.Humidity = function (options, value, isnormal) {
        var dft = {
            parentid: '',       //容器
            px: 0,              //相对与parentid x坐标
            py: 0,              //相对于parentid y坐标
            //parentid,px,py全部有值才有效
            width: 120,         //面板宽度
            height: 150,        //面板高度
            current: 0,         //当前湿度
            unit: '',            //单位
            isnormal: 1,       //重量是否正常;1表示正常，0不正常
            title: '湿度'
        }

        this.setCurrent = function (value, isnormal) {
            if (value > 100)
                value = 100;
            if (value < 0)
                value = 0;
            var rct_wholoe = this.svg.select("#rct_whole");
            var cheight = rct_wholoe.attr("height");
            var toheight = cheight * (100 - value) / 100;

            var rct_panelpre = this.svg.select("#rct_panelpre");
            var rct_panel = this.svg.select("#rct_panel");
            var t_current = this.svg.select("#t_current");
            var rct_inner = this.svg.select("#rct_inner");

            var opts = this.opts;
            if (toheight > rct_panel.attr("height")) {
                rct_panelpre.animate({ height: toheight }, 500, mina.linear, function () {
                    rct_panel.animate({ height: toheight }, 500, mina.bounce);
                    Snap.animate(parseInt(t_current.attr("text")), value, function (v) {
                        t_current.attr({ text: parseInt(v) + opts.unit });
                    }, 250);
                })
            } else {
                rct_panel.animate({ height: toheight }, 500, mina.linear, function () {
                    rct_panelpre.animate({ height: toheight }, 500, mina.bounce);
                    Snap.animate(parseInt(t_current.attr("text")), value, function (v) {
                        t_current.attr({ text: parseInt(v) + opts.unit });
                    }, 250);
                })
            }

            if (isnormal) {
                t_current.attr({ fill: '#ff0000' });
                rct_wholoe.animate({ fill: '#ff0000' }, 500, mina.bounce);
            }
            else {
                t_current.attr({ fill: '#32a5dc' });
                rct_wholoe.animate({ fill: '#32a5dc' }, 500, mina.bounce);
            }

        }

        this.intil = function (opts) {
            var pid = "#" + opts.parentid;
            this.appendTo(pid);

            $(this).width(opts.width);
            $(this).height(opts.height);
            if (opts.parentid != undefined && opts.px != undefined && opts.py != undefined) {
                $(pid).css("position", "relative");
                $(this).css("position", "absolute");
                $(this).css("top", opts.py);
                $(this).css("left", opts.px);
            }
            this.empty();
            this.append($.fn.Humidity.GetHumidityHtml(this.Index));
            this.svg = Snap("#humidity_" + this.Index);
            if (this.svg == null || this.svg == undefined)
                return;
            this.svg.attr("width", opts.width);
            this.svg.attr("height", opts.height);

            this.svg.select("#t_title").attr({ text: opts.title });

            this.current = opts.min;
            this.opts = opts;
            this.data("opts", opts);
        }

        if (typeof options == "string") {
            this.Index = this.data("index");
            this.opts = this.data("opts");
            this.svg = Snap("#humidity_" + this.Index);
            this.current = this.data("current");
            if (options == "setcurrent") {
                this.setCurrent(value, isnormal);
            }
        } else {
            var opts = $.extend(dft, options);
            var container = this;
            $.fn.Humidity.index += 1
            this.Index = $.fn.Humidity.index;
            this.data("index", this.Index);
            this.intil(opts);
            if (opts.current.url != undefined && opts.current.delay != undefined) {
                var obj = this;
                var timer = undefined;
                var loadRemote = function () {
                    $.ajax({
                        url: opts.current.url,
                        data: opts.current.param,
                        success: function (data) {
                            data = eval(data)[0];
                            if (data != null && data != undefined && data.current != null && data.current != undefined)
                                obj.setCurrent(data.current, data.isnormal, null)

                        }
                    })
                }
                loadRemote();
                timer = setInterval(loadRemote, opts.current.delay);
            } else {
                this.setCurrent(opts.current, opts.isnormal);
            }
        }

    }

    $.fn.Humidity.GetHumidityHtml = function (index) {
        var svghtml = [];
        svghtml.push('<svg id="humidity_' + index + '" viewBox="0,0,120,150" preserveAspectRatio="xMidYMid meet">');
        svghtml.push('<defs>');
        svghtml.push('<clipPath id="cp_bg">');
        svghtml.push('<path d="M60 10 C-50 155, 170 155,60 10">');
        svghtml.push('</path>');
        svghtml.push('</clipPath>');
        svghtml.push('<clipPath id="cp_bg1">');
        svghtml.push('<path d="M60 12 C-45 151, 165 151,60 12" fill="#32a5dc" stroke="black" stroke-width="2">');
        svghtml.push('</path>');
        svghtml.push('</clipPath>');
        svghtml.push('<radialGradient id="bg" cx="45%" cy="60%" r="80%" fx="30%" fy="70%">');
        svghtml.push('<stop offset="0%" stop-color="white" stop-opacity="1"></stop>');
        svghtml.push('<stop offset="45%" stop-color="white" stop-opacity="0.1"></stop>');
        svghtml.push('</radialGradient>');
        svghtml.push('</defs>');
        svghtml.push('<rect id="rct_whole" x="20" y="10" width="80" height="110" fill="#32a5dc" clip-path="url(#cp_bg)"></rect>');
        svghtml.push('<rect id="rct_panelpre" x="25" y="10" width="80" height="110" fill="white" clip-path="url(#cp_bg1)" opacity="0.5"></rect>');
        svghtml.push('<rect id="rct_panel" x="25" y="10" width="80" height="110" fill="white" clip-path="url(#cp_bg1)"></rect>');
        svghtml.push('<rect id="rct_inner" x="20" y="10" width="80" height="110" fill="url(#bg)" clip-path="url(#cp_bg)"></rect>');
        svghtml.push('<text id="t_title" x="50%" y="140" fill="#32a5dc" font-weight="bolder" text-anchor="middle">湿度</text>');
        svghtml.push('<text id="t_current" x="60%" y="25" fill="#32a5dc" font-weight="bolder"  font-size="150%" >0</text>');
        svghtml.push('</svg>');
        return svghtml.join('');
    }
    $.fn.Humidity.index = 0;
})(jQuery);