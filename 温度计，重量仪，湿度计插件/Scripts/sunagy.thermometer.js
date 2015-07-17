(function ($) {
    $.fn.Thermometer = function (options, value,isnormal) {
        var dft = {
            parentid: '',       //容器
            px: 0,              //相对与parentid x坐标
            py: 0,              //相对于parentid y坐标
            //parentid,px,py全部有值才有效
            width: 130,         //面板宽度
            height: 400,        //面板高度
            max: 50,            //温度最大值
            min: 0,             //温度最小值
            current: 0,         //当前温度
            unit: '',            //单位
            isnormal: 1,       //温度是否正常;1表示正常，0不正常
            title: '温度'
        }

        this.SetTitle = function (title) {
            var etitle = this.svg.getElementById("thermometer_txttitle_" + this.Tindex);
            if (etitle != null && etitle != undefined) {
                etitle.textContent = title;
            }

        }

        this.SetRange = function (maxnum, minnum) {
            var max = this.svg.getElementById("thermometer_svg_max_" + this.Tindex);
            var min = this.svg.getElementById("thermometer_svg_min_" + this.Tindex);
            this.Max = maxnum;
            this.Min = minnum;
            if (max != null && max != undefined)
                max.textContent = maxnum;
            if (min != null && min != undefined)
                min.textContent = minnum;
        }

        this.SetCurrent = function (num, isnormal) {
            if (num < this.Min)
                return;
            var rct_panel = Snap("#thermometer_rct_panel_" + this.Tindex);
            var rct_current = Snap("#thermometer_rct_current_" + this.Tindex);
            var txt_current = Snap("#thermometer_svg_current_" + this.Tindex);

            var heightsum = 275;
            var value = this.Max - this.Min;

            //温度水银柱高度变化动画
            var fromheight = parseFloat(rct_panel.attr("height"));
            var toheight = heightsum - num * 240 / value;

            rct_panel.animate({ height: toheight }, 1000, mina.Linear);
            var txt_y = 305 - num * 240 / value;
            txt_current.animate({ y: txt_y }, 1000, mina.linear);
            var opts = this.Opts;
            Snap.animate(parseFloat(txt_current.attr("text")), num, function (v) {
                txt_current.attr({ text: parseInt(v) + opts.unit });
            }, 1000)
            if (num >= 100)
                txt_current.attr("x", 78);
            else
                txt_current.attr("x", 85);

            var cIsnormal = txt_current.data("isnormal") == undefined ? 1 : txt_current.data("isnormal");

            //显示状态变化
            if (cIsnormal > isnormal) {
                rct_current.animate({ fill: '#ff0000' }, 2000, mina.Linear);
                txt_current.attr({ fill: "#ff0000" });
            } else if (cIsnormal < isnormal) {
                rct_current.animate({ fill: '#32a5dc' }, 2000, mina.Linear);
                txt_current.attr({ fill: "#32a5dc" });
            }
            else {
                rct_current.animate({ opacity: 0.5 }, 1000, mina.linear, function () {
                    rct_current.animate({ opacity: 1 }, 1000, mina.linear);
                });
            }
            txt_current.data("isnormal", isnormal);
        }

        if (typeof options == "string") {
            var id = this.attr("id");
            this.Opts = this.data(id);
            this.Tindex = this.data(id + "_Tindex");
            var svg = this.find("svg")[0];
            this.svg = svg;
            this.Max = this.Opts.max;
            this.Min = this.Opts.min;
            if (options == "setcurrent") {
                this.SetCurrent(value,isnormal);
            }
        } else {
            var opts = $.extend(dft, options);
            this.Opts = opts;
            this.Isnormal = opts.isnormal;
            this.Tindex = $.fn.Thermometer.index + 1;
            $(this).append($.fn.Thermometer.GetThermometerHtml(this.Tindex));
            var svgs = $(this).find("svg");
            var svg = svgs[0];
            if (svg != null && svg != undefined) {
                if (opts.parentid != undefined && opts.px != undefined && opts.py != undefined) {
                    $(this).appendTo("#" + opts.parentid);
                    $(opts.parentid).css("position", "relative");
                    $(this).css("position", "absolute");
                    $(this).css("top", opts.py);
                    $(this).css("left", opts.px);
                }
                $(this).css("width", opts.width);
                $(this).css("height", opts.height);
                this.svg = svg;
                var w = parseFloat(opts.width);
                svg.style.width = w + "px";
                var h = parseFloat(opts.height);
                svg.style.height = h + "px";

                if (opts.title != "" && opts.title != undefined) {
                    this.SetTitle(opts.title);
                }
                this.SetRange(opts.max, opts.min);
                var obj = this;
                var timer = undefined;
                if (opts.current.url != undefined && opts.current.delay != undefined) {
                    var loadRemote = function () {
                        $.ajax({
                            url: opts.current.url,
                            data: opts.current.param,
                            success: function (data) {
                                data = eval(data)[0];
                                if (data != null && data != undefined && data.current != null && data.current != undefined)
                                    obj.SetCurrent(data.current, data.isnormal, null)

                            }
                        })
                    }
                    loadRemote();
                    timer = setInterval(loadRemote, opts.current.delay);
                } else {
                    this.SetCurrent(opts.current, opts.isnormal, null);
                }
                var id = this.attr("id");
                this.data(id, opts)
                this.data(id + "_Tindex", this.Tindex);
            }
        }

    }
    $.fn.Thermometer.GetThermometerHtml = function (index) {
        var svghtml = [];
        svghtml.push('<svg id="thermometer_' + index + '" viewBox="0,0,130,400" preserveAspectRatio="xMidYMid meet"  >                                                             ');
        svghtml.push('     <defs>                                                                                                                           ');
        svghtml.push('<linearGradient id="thermometer_bg_' + index + '" x1="1%" y1="20%" x2="100%" y2="20%">                                                                          ');
        svghtml.push('             <stop offset="10%" style="stop-color:#F0F0F0;stop-opacity:0.1" />                                                                     ');
        svghtml.push('             <stop offset="40%" style="stop-color:white;stop-opacity:0.3" />                                                          ');
        svghtml.push('             <stop offset="50%" style="stop-color:white;stop-opacity:0.4" />                                                          ');
        svghtml.push('             <stop offset="80%" style="stop-color:#F0F0F0;stop-opacity:0.1" />                                                        ');
        svghtml.push('         </linearGradient>                                                                                                            ');
        svghtml.push('         <clipPath id="thermometer_cp_' + index + '">                                                                                                         ');
        svghtml.push('             <path d="M25 50 A25,25 180 1 1 75,50 L75 300 A25,25 180 1 1 25,300 z" fill="none" />     ');
        svghtml.push('         </clipPath>                                                                                                                  ');
        svghtml.push('     </defs>                                                                                                                          ');
        svghtml.push('     <rect id="thermometer_rct_current_' + index + '" x="25" y="25" width="50" height="300" fill="#32a5dc" clip-path="url(#thermometer_cp_' + index + ')" style="">                     ');
        svghtml.push('     </rect>                                                                                                                          ');
        svghtml.push('     <rect id="thermometer_rct_panel_' + index + '" x="25" y="25" height="275" width="50" fill="#c1e2f4" clip-path="url(#thermometer_cp_' + index + ')">                                ');
        svghtml.push('     </rect>                                                                                                                          ');
        svghtml.push('     <rect id="thermometer_rct_white_' + index + '" x="25" y="25" height="300" width="50" fill="url(#thermometer_bg_' + index + ')" clip-path="url(#thermometer_cp_' + index + ')"></rect>                        ');
        svghtml.push('     <path style="" id="p_border" d="M25 50 A25,25 180 1 1 75,50 L75 300 A25,25 180 1 1 25,300 z" stroke="#6fb4d1" stroke-width="2" fill="none" />     ');
        svghtml.push('     <path d="M50 300 h25 M60 288 h15 M60 276 h15 M60 264 h15 M60 252 h15                                                             ');
        svghtml.push('M50 240 h25 M60 228 h15 M60 216 h15 M60 204 h15 M60 192 h15                                                                           ');
        svghtml.push('M50 180 h25 M60 168 h15 M60 156 h15 M60 144 h15 M60 132 h15                                                                           ');
        svghtml.push('M50 120 h25 M60 108 h15 M60 96 h15  M60 84 h15  M60 72 h15                                                                            ');
        svghtml.push('M50 60 h25                                                                                                                            ');
        svghtml.push('" stroke="white" stroke-width="3"></path>                                                                                             ');
        svghtml.push('        <text id="thermometer_txttitle_' + index + '" x="40%" y="360" font-size="150%" text-anchor="middle" font-weight="900" fill="#6fb4d1">温度</text>                                               ');
        svghtml.push('        <text id="thermometer_svg_max_' + index + '" x="-20" y="65" font-weight="bolder" font-size="150%"  fill="#6fb4d1">100</text>                                                                                   ');
        svghtml.push('        <text id="thermometer_svg_min_' + index + '" x="0" y="305" font-weight="bolder"   font-size="150%"  fill="#6fb4d1">0</text>                                                                                    ');
        svghtml.push('        <text id="thermometer_svg_current_' + index + '" x="90" y="320" font-weight="bolder" font-size="180%" fill="#32a5dc">0</text>       ');
        svghtml.push('    </svg>                                                                                                                            ');
        $.fn.Thermometer.index += 1;
        return svghtml.join("");
    }
    $.fn.Thermometer.index = 0;
})(jQuery);

