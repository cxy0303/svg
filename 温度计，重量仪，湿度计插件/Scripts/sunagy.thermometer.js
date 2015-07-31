(function ($) {
    $.fn.Thermometer = function (options, value, isnormal) {
        var dft = {
            px: 0,              //相对与parentid x坐标
            py: 0,              //相对于parentid y坐标
            //parentid,px,py全部有值才有效
            width: 130,         //面板宽度
            height: 400,        //面板高度
            max: 50,            //温度最大值
            min: 0,             //温度最小值
            current: 20,         //当前温度
            unit: 'C',           //单位
            isnormal: 1,        //温度是否正常;1表示正常，0不正常
            title: '温度',      //标题说明  
            draggable: false,    //是否可以基于父容器拖拽
            resizeable: false,   //是否可以改变大小
        }

        this.SetTitle = function (title) {
            var etitle = this.svg.select("thermometer_txttitle_" + this.Tindex);
            if (etitle != null && etitle != undefined) {
                etitle.attr({ text: title });
            }

        }

        this.SetRange = function (maxnum, minnum) {
            var max = this.svg.select("thermometer_svg_max_" + this.Tindex);
            var min = this.svg.select("thermometer_svg_min_" + this.Tindex);
            this.Max = maxnum;
            this.Min = minnum;
            if (max != null && max != undefined)
                max.attr({ text: maxnum });
            if (min != null && min != undefined)
                min.attr({ text: minnum });
        }

        this.SetCurrent = function (num, isnormal) {
            if (num < this.Min)
                num = this.Min;
            if (num > this.Max)
                num = this.Max;
            var rct_panel = Snap("#thermometer_rct_panel_" + this.Tindex);
            var rct_current = Snap("#thermometer_rct_current_" + this.Tindex);
            var txt_current = Snap("#thermometer_svg_current_" + this.Tindex);

            var heightsum = 275;
            var value = this.Max - this.Min;

            //温度水银柱高度变化动画
            var fromheight = parseFloat(rct_panel.attr("height"));
            var toheight = heightsum - (num - this.Min) * 240 / value;

            rct_panel.animate({ height: toheight }, 1000, mina.Linear);
            var txt_y = 305 - (num - this.Min) * 240 / value;
            txt_current.animate({ y: txt_y }, 1000, mina.linear);
            var opts = this.Opts;
            Snap.animate(parseFloat(txt_current.attr("text")), num, function (v) {
                txt_current.attr({ text: parseInt(v) + opts.unit });
            }, 1000)

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

        this.Draggable = function () {
            var main = this;
            $(this).draggable({
                addClasses: true,
                containment: "parent",
                opacity: 0.5,
                stop: function (event, ui) {
                    main.data("x", ui.position.left);
                    main.data("y", ui.position.top);
                }
            });
        }

        this.Resizeable = function () {
            var svg = this.svg;
            var main = this;
            $(this).resizable({
                resize: function (event, ui) {
                    svg.attr("height", ui.size.height);
                    svg.attr("width", ui.size.width);
                },
                stop: function (event, ui) {
                    main.data("w", ui.size.width);
                    main.data("h", ui.size.height);
                }
            });
        }

        if (typeof options == "string") {
            var id = this.attr("id");
            this.ID = id;
            this.Opts = this.data(id);
            this.Tindex = this.data(id + "_Tindex");
            var svg = this.find("svg")[0];
            this.svg = svg;
            this.Max = this.Opts.max;
            this.Min = this.Opts.min;
            if (options == "setcurrent") {
                this.SetCurrent(value, isnormal);
            } else if (options == "getbox") {
                return {
                    x: parseInt(this.data("x")),
                    y: parseInt(this.data("y")),
                    w: parseInt(this.data("w")),
                    h: parseInt(this.data("h"))
                };
            }
        } else {
            var opts = $.extend(dft, options);
            this.Opts = opts;
            this.Isnormal = opts.isnormal;
            this.Tindex = $.fn.Thermometer.index + 1;
            $(this).append($.fn.Thermometer.GetThermometerHtml(this.Tindex));
            this.svg = Snap("#thermometer_" + this.Tindex);
            var svg = this.svg;
            if (svg != null && svg != undefined) {
                if (opts.draggable) {
                    $(this).css("position", "absolute");
                    $(this).css("top", opts.py);
                    $(this).css("left", opts.px);
                } else {
                    $(this).css("margin", "auto");
                }
                $(this).css("width", opts.width);
                $(this).css("height", opts.height);
                this.svg = svg;
                var w = parseFloat(opts.width);
                svg.attr("width", w);
                var h = parseFloat(opts.height);
                svg.attr("height", h);

                if (opts.title != "" && opts.title != undefined) {
                    this.SetTitle(opts.title);
                }
                this.SetRange(opts.max, opts.min);
                if (opts.draggable)
                    this.Draggable();
                if (opts.resizeable)
                    this.Resizeable();
                if (opts.draggable || opts.resizeable) {
                    $(this).hover(function () {
                        $(this).css("border", "1px dashed grey");
                    }, function () {
                        $(this).css("border", "none");
                    })
                }
                $(this).css("cursor","pointer");
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
                this.ID = id;
                this.data(id, opts);
                this.data("x", parseFloat($(this).css("left")));
                this.data("y", parseFloat($(this).css("top")));
                this.data("w", parseFloat($(this).css("width")));
                this.data("h", parseFloat($(this).css("height")));
                this.data(id + "_Tindex", this.Tindex);
            }
        }

    }
    $.fn.Thermometer.GetThermometerHtml = function (index) {
        var svghtml = [];
        svghtml.push('<svg id="thermometer_' + index + '" viewBox="-30,0,160,400" preserveAspectRatio="xMidYMid meet"  >                                                             ');
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
        svghtml.push('        <text id="thermometer_txttitle_' + index + '" x="31%" y="360" font-size="150%" text-anchor="middle" font-weight="900" fill="#6fb4d1">温度</text>                                               ');
        svghtml.push('        <text id="thermometer_svg_max_' + index + '" x="-15%" y="65" font-weight="bolder" font-size="150%"  fill="#6fb4d1">100</text>                                                                                   ');
        svghtml.push('        <text id="thermometer_svg_min_' + index + '" x="0" y="305" font-weight="bolder"   font-size="150%"  fill="#6fb4d1">0</text>                                                                                    ');
        svghtml.push('        <text id="thermometer_svg_current_' + index + '" x="90" y="320" font-weight="bolder" font-size="180%" fill="#32a5dc">0</text>       ');
        svghtml.push('    </svg>                                                                                                                            ');
        $.fn.Thermometer.index += 1;
        return svghtml.join("");
    }
    $.fn.Thermometer.index = 0;
})(jQuery);

