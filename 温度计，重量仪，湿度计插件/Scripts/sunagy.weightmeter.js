(function ($) {
    $.fn.Weightmeter = function (options, value, isnormal) {
        var dft = {
            px: 0,              //相对于父容器 x坐标
            py: 0,              //相对于父容器y坐标
            width: 130,         //面板宽度
            height: 400,        //面板高度
            max: 50,            //重量最大值
            min: 0,             //重量最小值
            current: 20,         //当前重量
            unit: 'kg',            //单位
            isnormal: 1,       //重量是否正常;1表示正常，0不正常,
            draggable: false,   //是否可以拖拽
            title: '重量仪',
            draggable: false,    //是否可以基于父容器拖拽
            resizeable: false,   //是否可以改变大小
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

        this.setCurrent = function (val, isnormal) {
            if (this.current == value)
                return;

            var temp = val;

            if (val < this.opts.min)
                temp = this.opts.min;
            if (val > this.opts.max)
                temp = this.opts.max;

            if (this.current < this.opts.min)
                this.current = this.opts.min;
            if (this.current > this.opts.max)
                this.current = this.opts.max;

            var lastangel = 180 / (this.opts.max - this.opts.min) * (this.current - this.opts.min);
            var angel = 180 / (this.opts.max - this.opts.min) * (temp - this.opts.min);
            var t_current = this.svg.select("#t_current");
            var movepath = this.svg.select("#movepath");
            var pointer = this.svg.select("#pointer");
            Snap.animate(lastangel, angel, function (v) {
                var rotate = new Snap.Matrix().rotate(v + 0.5, 175, 160);
                movepath.transform(rotate);
                pointer.transform(new Snap.Matrix().rotate(v, 175, 160));
            }, 1000);

            var opts = this.opts;
            Snap.animate(this.current, val, function (num) {
                num = parseInt(num);
                t_current.attr({ text: num + opts.unit });
            }, 1000);


            if (1 == isnormal) {
                movepath.animate({ fill: '#00DB00' }, 2000, mina.bounce);
                pointer.animate({ fill: '#00DB00' }, 2000, mina.bounce);
                t_current.animate({ fill: '#00DB00' }, 2000, mina.bounce);
            } else if (0 == isnormal) {
                movepath.animate({ fill: '#FF0033' }, 2000, mina.bounce);
                pointer.animate({ fill: '#FF0033' }, 2000, mina.bounce);
                t_current.animate({ fill: '#FF0033' }, 2000, mina.bounce);
            }

            this.current = val;
            this.data("current", val);
        }

        this.intil = function (opts) {
            $(this).width(opts.width);
            $(this).height(opts.height);
            if (opts.px != undefined && opts.py != undefined) {
                $(this).css("position", "absolute");
                $(this).animate({ "top": opts.py, "left": opts.px }, 0, null);
            } else {
                $(this).css("margin", "auto");
            }
            this.empty();
            this.append($.fn.Weightmeter.GetWeightmeterHtml(this.Index));
            this.svg = Snap("#weightmeter_" + this.Index);
            if (this.svg == null || this.svg == undefined)
                return;
            this.svg.attr("width", opts.width);
            this.svg.attr("height", opts.height);

            var shadow = this.svg.paper.filter(Snap.filter.shadow(-2, 2, 3));
            var path = this.svg.select("#panel").attr({
                fill: '#66B3FF',
                filter: shadow
            });

            var pointer = this.svg.select("#pointer").attr({
                filter: shadow
            })

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
            $(this).css("cursor", "pointer");

            this.svg.select("#t_title").attr({ text: opts.title });
            this.svg.select("#t_current").attr({ text: 0 });
            var v = (opts.max - opts.min) / 20;
            this.svg.select('#t1').attr({ text: opts.min });
            this.svg.select('#t2').attr({ text: opts.min + parseInt(v * 5) });
            this.svg.select('#t3').attr({ text: opts.min + parseInt(v * 10) });
            this.svg.select('#t4').attr({ text: opts.min + parseInt(v * 15) });
            this.svg.select('#t5').attr({ text: opts.max });
            this.current = opts.min;
            this.opts = opts;
            this.data("opts", opts);
            this.data("x", parseFloat($(this).css("left")));
            this.data("y", parseFloat($(this).css("top")));
            this.data("w", parseFloat($(this).css("width")));
            this.data("h", parseFloat($(this).css("height")));
        }

        if (typeof options == "string") {
            this.Index = this.data("index");
            this.opts = this.data("opts");
            this.svg = Snap("#weightmeter_" + this.Index);
            this.current = this.data("current");
            if (options == "setcurrent") {
                this.setCurrent(value, isnormal);
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
            var container = this;
            $.fn.Weightmeter.index += 1
            this.Index = $.fn.Weightmeter.index;
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
    $.fn.Weightmeter.GetWeightmeterHtml = function (index) {
        var html = [];
        html.push('<svg id="weightmeter_' + index + '"  viewBox="0,0,350,200"  preserveAspectRatio="xMidYMid meet">');
        html.push('<defs>');
        html.push('<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">');
        html.push('                    <stop offset="0%" stop-color="#ECF5FF" stop-opacity="0"></stop>');
        html.push('                    <stop offset="100%" stop-color="#E0E0E0" stop-opacity="1"></stop>');
        html.push('</linearGradient>');
        html.push('<clipPath id="scale">');

        for (var i = 0; i < 20; i++) {
            var angel = 9 * i;
            if (i % 5 == 0) {
                angel -= 1;
                html.push('<path d="M32 162 L32 153 L62 155 L62 161z" transform="rotate(' + angel + ' 175 160)"></path>');
            }
            else
                html.push('<path d="M32 162 L32 160 h15 L47 162z" transform="rotate(' + angel + ',175,160)"></path>');
        }

        html.push('<path d="M32 162 L32 153 L62 155 L62 161z" transform="rotate(178 175 160)"></path>');
        html.push('<text id="t1" x="68" y="163"  font-size="200%">0</text>');
        html.push('<text id="t2"  x="95" y="100"  font-size="200%">10</text>');
        html.push('<text id="t3"  x="164" y="72"  font-size="200%">20</text>');
        html.push('<text id="t4"  x="225" y="105"  font-size="200%">20</text>');
        html.push('<text id="t5"  x="62%" y="81%"  font-size="200%">20</text>');
        html.push('</clipPath>');
        //html.push('<path id="textpath" d="M15 162 A110,111 1 1 1 335,162"></path>');
        html.push('</defs>');
        html.push('<path id="panel" d="M25 160 A100,100 1 1 1 325,160 A2,2 1 1 1 320 160 A96,96 1 1 0 30 160 A2,2 1 1 1 25,160" stroke="#66B3FF"');
        html.push('stroke-width="1" fill="#66B3FF"></path>');

        html.push('<g id="gpath" clip-path="url(#scale)">');
        html.push('<path d="M30 162 A95,96 1 1 1 320,162z" fill="#66B3FF"></path>');
        html.push('<path id="movepath" d="M30 162 A95,96 1 1 0 320,162z" fill="#00CC99" ">');
        html.push('</path>');

        html.push('</g>');
        html.push('<g font-weight="bolder" fill="#66B3FF" font-size="200%">');

        html.push('<text x="50%" y="120" id="t_title" text-anchor="middle" font-size="90%">');
        //html.push('<textPath     xlink:href="#textpath">');
        //html.push('</textPath>');
        html.push('</text>');
        html.push('<text id="t_current"  x="50%" y="100%"  text-anchor="middle"  font-size="130%" >');
        html.push('<text>');
        html.push('</g>');
        html.push('<path id="pointer" d="M50 160 L175 152  L188 160 L188 160 L175 168z" fill="#00CC99" >');
        html.push('</path>');
        html.push('<circle cx="175" stroke="white" stroke-width="1" cy="160" r="2" fill="white"></circle>');
        html.push('</svg>');
        return html.join('');
    }
    $.fn.Weightmeter.index = 0;
})(jQuery);