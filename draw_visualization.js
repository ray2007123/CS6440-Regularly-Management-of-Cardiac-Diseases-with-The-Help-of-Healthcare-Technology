var r;

var p2;

var score_if_non_smoker
    , score_if_sbp_of_120
    , score_if_all_optimal = null;

var reynolds_risk_score = function(p){
  var parameters = {}
    , result = null;

  if (p.gender.value === 'female') {
    params = {
      'age': 0.0799,
      'sbp': 3.137,
      'hsCRP': 0.180,
      'cholesterol': 1.382,
      'HDL': -1.172,
      'smoker': 0.818,
      'fx_of_mi': 0.438
    }
  } else {
    params = {
      'age': 4.385,
      'sbp': 2.607,
      'hsCRP': 0.102,
      'cholesterol': 0.963,
      'HDL': -0.772,
      'smoker': 0.405,
      'fx_of_mi': 0.541
    }
  }

  var b1 = params.age          * (p.gender.value==='female' ? p.age.value : Math.log(p.age.value))
    , b2 = params.sbp          * Math.log(p.sbp.value)
    , b3 = params.hsCRP        * Math.log(p.hsCRP.value)
    , b4 = params.cholesterol  * Math.log(p.cholesterol.value)
    , b5 = params.HDL          * Math.log(p.HDL.value)
    , b6 = params.smoker       * (p.smoker_p.value ? 1 : 0)
    , b7 = params.fx_of_mi     * (p.fx_of_mi_p.value ? 1 : 0);

  var B = b1 + b2 + b3 + b4 + b5 + b6 + b7;

  if (p.gender.value === 'female') {
    var a = Math.exp(B-22.325)
      , b = Math.pow(0.98634, a)
      , c = 1 - b
      , d = c * 100
      , result = (1 - Math.pow(0.98634, (Math.exp(B-22.325)))) * 100
  } else {
    var a = Math.exp(B-33.097)
      , b = Math.pow(0.8990, a)
      , c = 1 - b
      , d = c * 100
      , result = (1 - Math.pow(0.8990,  (Math.exp(B-33.097)))) * 100
  }
  return Math.round((result < 10 ? result.toPrecision(1) : result.toPrecision(2)))
}

var compute_other_scores = function(){
  p2 = $.extend(true, {}, p);
  p2.sbp.value = (p2.sbp.value - 10 >= 0) ? p2.sbp.value - 10 : 0;
  sbp_10_lower = p2.sbp.value;
  score_if_sbp_of_10_lower = reynolds_risk_score(p2);
  p2.sbp.value = p.sbp.value; // reset sbp
  p2.smoker_p.value = false;
  score_if_non_smoker = reynolds_risk_score(p2);
  p2.hsCRP.value = 0.5;
  p2.cholesterol.value = 160;
  p2.HDL.value = 60
  p2.LDL.value = 100;
  score_if_all_optimal = reynolds_risk_score(p2);
}

var p = {
  'givenName':    {'value': null}
  ,'familyName':  {'value': null}
  ,'gender':      {'value': null}
  ,'birthday':    {'value': null}
  ,'age':         {'value': null}
  ,'hsCRP':       {'value': null}
  ,'cholesterol': {'value': null}
  ,'HDL':         {'value': null}
  ,'LDL':         {'value': null}
  ,'sbp':         {'value': null}
  ,'smoker_p':    {'value': null}
  ,'fx_of_mi_p':  {'value': null}
}

var redraw = function(){
  var score = reynolds_risk_score(p);
  compute_other_scores();
  r.score_text.animate({opacity: 0}, 500, '>', function(){
    this.attr({text: score+'%'});
    this.animate({opacity: 1}, 500, '>');
  })

  r.score_if_sbp_of_10_lower_text.attr({text: score_if_sbp_of_10_lower+'%'});
  r.sbp_10_lower.attr({text: 'if your blood pressure were '+ sbp_10_lower +'mm/Hg'});
  r.score_if_all_optimal_text.attr({text: score_if_all_optimal+'%'});
  r.if_you_quit_set.items[0].attr({text: score_if_non_smoker+'%'});
  r.risk_prelude.attr({text: 'If you\'re ' + (p.smoker_p.value ? '' : 'not ') +
     'a smoker with a blood pressure\n of ' + p.sbp.value + 'mm/Hg ' + (p.fx_of_mi_p.value ?
      'and have ' : 'and don\'t have ') +
      'a family\n history of heart attack before the age of 60\n (one or both parents) your risk over 10 years is:'})

  if (p.smoker_p.value === false) {
    r.if_you_quit_set.animate({opacity: 0}, 500, '>');
    r.quit_text_1.attr({text: 'Staying smoke-free'})
    r.quit_text_2.attr({text: 'is one of the best\nways to improve your\nheart disease risk'})
  } else {
    r.if_you_quit_set.animate({opacity: 1}, 500, '>');
    r.quit_text_1.attr({text: 'Quitting smoking'})
    r.quit_text_2.attr({text: 'can decrease your\nheart disease risk\nby 50% or more'})
  }
}

var draw_visualization = function() {
    var score = reynolds_risk_score(p);
    p2 = $.extend(true, {}, p); // deep copy needed here

    compute_other_scores();

    r = Raphael('holder');
    r.if_you_quit_set = r.set();

    // set default txtattrs
    r.g.txtattr = {
      'font-family': 'Calibri, \'Helvetica Neue\', Helvetica, Verdana, sans-serif',
      'font-size': '16px',
      'text-anchor': 'start',
      'fill': '#555'
    };

    // set up overall layout and text
    // using a 8 column grid on 800px
    var headline = r.g.text(10, 20, 'Bloodwork Cardiology Result').attr({'font-size': '24px'})
    // r.path("M10 40 L300 40").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'})

    // pad in 30px
    r.g.text(30, 55, 'Patient info').attr({'font-size': '18px', 'font-weight': 'bold'})

    r.g.text(30, 80+3, 'NAME:').attr({'fill': '#888', 'font-size': '12px', 'font-weight': '200'});
    r.g.text(70, 80, p.givenName.value + ' ' + p.familyName.value).attr({'font-size': '24px', 'font-weight': 'normal'})

    r.g.text(30, 100+3, 'GENDER:').attr({'fill': '#888', 'font-size': '12px', 'font-weight': '200'});
    r.g.text(82, 100+2, p.gender.value == 'female' ? 'F' : 'M')

    r.g.text(102, 100+3, 'AGE:').attr({'fill': '#888', 'font-size': '12px', 'font-weight': '200'});
    r.g.text(142-1, 100, p.age.value)

    r.g.text(162, 100+3, 'DOB:').attr({'fill': '#888', 'font-size': '12px', 'font-weight': '200'});
    r.g.text(192-1, 100, p.birthday.value.toString("yyyy-MM-dd"))

    // draggable for sbp
    var c = null;
    r.g.text(500, 55-24, 'Note: these results are valid for non-diabetics only!').attr({'font-size': '12px', 'font-weight': 'normal', 'fill': "#888"});

    r.circle(500+10, 55, 8)
     .attr({
       stroke: '#F4804E',
       fill: p.smoker_p.value ? '#F4804E' : '#F6F6F6' // use a bg colored fill so hover events don't fire only while mouse in on the stroke
     })
     .hover(function(){this.attr({'fill': '#F4804F', 'cursor': 'pointer'})},
            function(){if(!p.smoker_p.value)this.attr({'fill': '#F6F6F6', 'cursor': 'normal'})})
     .click(function(){
       p.smoker_p.value = !p.smoker_p.value
       this.attr('fill', p.smoker_p.value ? '#F4804E' : '#F6F6F6')
       redraw();
     })
     r.g.text(500+20+10, 55, 'Current smoker?').attr({'font-size': '16px', 'font-weight': 'normal'});

     r.circle(500+10, 55+24, 8)
      .attr({
        stroke: '#F4804E',
        fill: p.fx_of_mi_p.value ? '#F4804E' : '#F6F6F6'
      })
      .hover(function(){this.attr({'fill': '#F4804F', 'cursor': 'pointer'})},
             function(){if(!p.fx_of_mi_p.value)this.attr({'fill': '#F6F6F6', 'cursor': 'normal'})})
      .click(function(){
        p.fx_of_mi_p.value = !p.fx_of_mi_p.value
        this.attr('fill', p.fx_of_mi_p.value ? '#F4804E' : '#F6F6F6')
        redraw();
      })
      r.g.text(500+20+10, 55+24, 'Family history of heart attack?').attr({'font-size': '16px', 'font-weight': 'normal'});


    // SBP slider
    r.g.text(500+20+10, 55+24+24, 'Systolic blood pressure').attr({'font-size': '16px', 'font-weight': 'normal'});
    var min_x = 415
      , max_x = 515
      , len_x = max_x - min_x
      , start_value = 100
      , offset_value = 90
      , start_value_delta = p.sbp.value - offset_value
      , start_x = min_x + start_value_delta
      , y = 55+24+24
      , start_r = 13
      , click_r = 15

    r.path('M'+min_x+' '+y+' L'+max_x+' '+y).attr({'stroke': '#aaa', 'stroke-dasharray': '.', 'stroke-linecap': 'butt'})
    var t = r.g.text(start_x, y, p.sbp.value).attr({'cursor': 'pointer', 'font': '11px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'bold', 'fill': '#000'});
    c = r.circle(start_x, y, start_r).attr({
      opacity: .5,
      fill: '#F4804E',
      // fill: 'hsl(18, 88, 63)', // F4804E -> hsl(18, 88, 63)
      stroke: '#F4804E',
      cursor: 'pointer'
    });

    var start = function () {
        // storing original coordinates
        this.animate({r: click_r}, 500, ">");
        this.ox = this.attr('cx');
        this.sbp = p.sbp.value;
    },
    move = function (dx, dy) {
      var cx = this.ox + dx;

      if (cx < min_x) {
        cx = min_x;
      } else if (cx > max_x) {
        cx = max_x;
      }

      this.attr({cx: cx});
      // this.attr({fill: 'hsl(18, 88, '+ 63 + (cx - min_x) + ')'});
      this.sbp = Math.round((cx - min_x) + offset_value);
      t.attr({
          text: this.sbp,
          x: cx
      });
    },
    up = function () {
      this.sbp = Math.round((this.attr('cx') - min_x) + offset_value);
      this.animate({r: start_r}, 500, ">");
      p.sbp.value = this.sbp;
      redraw();
    };
    c.drag(move, start, up);


    r.path("M10 120 L760 120").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'})

    var y = 150;
    r.circle(30, y, 14).attr({'fill': '#F4804E', 'stroke': 'none'});
    r.g.text(30, y, '1').attr({'font': '18px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'bold', 'fill': '#fff'})
    r.g.text(50, y, 'About this test').attr({'font-size': '18px', 'font-weight': 'bold'})
    r.g.text(50, y+20, 'This report evaluates your potential risk of heart disease, heart attack, and stroke.').attr({'fill': '#888'})
      .attr({'font-size': '14px'})

    r.path("M10 190 L760 190").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'});

    y = 210;
    r.circle(30, y, 14).attr({'fill': '#F4804E', 'stroke': 'none'});
    r.g.text(30, y, '2').attr({'font': '18px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'bold', 'fill': '#fff'})
    r.g.text(50, y, 'Your Results').attr({'font-size': '18px', 'font-weight': 'bold'})



    var title = 'CRP level test'
      , x = 40
      , y = 255
      , w = 700
      , h = 65
      , units_n = 10
      , unit_w = w / units_n
      , space = 2
      , cap_x = w + x
      , cap_y = y
      , cap_mid_x = 760
      , cap_mid_y = y + h/2
      , cap_end_x = cap_x
      , cap_end_y = y + h

    // make width smaller with space, start x on unit_w multiple
    r.g.text(x, y-12, title).attr({'font-size': '18px', 'font-weight': 'normal'})

    r.rect(x+0,         y, unit_w-space,       h).attr({fill: '#61AFC9', stroke: 'none'});
    r.g.text(x, y+h+8, 'Low risk').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x, y+h+20, '0 mg/L').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w,    y, unit_w*2-space,     h).attr({fill: '#0B9DBC', stroke: 'none'});
    r.g.text(x+unit_w,  y+h+8, 'Average').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w,  y+h+20, '1 - 3').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    // no -space here since the cap is next
    r.rect(x+unit_w*3,  y, unit_w*7,           h).attr({fill: '#008EB0', stroke: 'none'});
    r.g.text(x+unit_w*3, y+h+8, 'High risk of cardiovascular disease').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*3, y+h+20, '3 - 10').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.path('M' + cap_x     + ' ' + cap_y +
           'L' + cap_mid_x + ' ' + cap_mid_y +
           'L' + cap_end_x + ' ' + cap_end_y +
           'z')
           .attr({'fill': '#008EB0', 'stroke': 'none'});

    // place circle on bar
    var circle_x = unit_w * p.hsCRP.value + x;
    r.circle(circle_x, y, 22).attr({'fill': '#F4804E', 'stroke': '#fff', 'stroke-width': '2px'});
    r.g.text(circle_x, y, p.hsCRP.value.toPrecision(2)).attr({'font': '20px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'normal', 'fill': '#fff'})

    // mildly non-proportional to make things look nicer
    var title = 'Total cholesterol level'
      , x = 40
      , y = 380
      , w = 700
      , h = 65
      , units_n = 30 // max value 300
      , unit_w = w / units_n
      , space = 2
      , cap_x = w + x
      , cap_y = y
      , cap_mid_x = 760
      , cap_mid_y = y + h/2
      , cap_end_x = cap_x
      , cap_end_y = y + h

    r.g.text(x, y-12, title).attr({'font-size': '14px'})

    r.rect(x+0,         y, unit_w*18-space,       h).attr({fill: '#A0BE78', stroke: 'none'});
    r.g.text(x, y+h+8, 'Desirable').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x, y+h+20, '0 mg/dL').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*18,    y, unit_w*4-space,     h).attr({fill: '#86AD52', stroke: 'none'});
    r.g.text(x+unit_w*18,  y+h+8, 'Borderline').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*18,  y+h+20, '200 - 239').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*22,  y, unit_w*8,           h).attr({fill: '#5E892B', stroke: 'none'});
    r.g.text(x+unit_w*22, y+h+8, 'High').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*22, y+h+20, '240+').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.path('M' + cap_x     + ' ' + cap_y +
           'L' + cap_mid_x + ' ' + cap_mid_y +
           'L' + cap_end_x + ' ' + cap_end_y +
           'z')
           .attr({'fill': '#5E892B', 'stroke': 'none'});

    var circle_x = (unit_w * (p.cholesterol.value / 10)) + x;
    r.circle(circle_x, y, 22).attr({'fill': '#F4804E', 'stroke': '#fff', 'stroke-width': '2px'});
    r.g.text(circle_x, y, parseInt(p.cholesterol.value)).attr({'font': '20px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'normal', 'fill': '#fff'})


    var title = 'LDL "bad" cholesterol'
      , x = 140
      , y = 500 // 130px from above
      , w = 600
      , h = 30
      , units_n = 30 // max value 300
      , unit_w = w / units_n
      , space = 2
      , cap_x = w + x
      , cap_y = y
      , cap_mid_x = 760 - 10 // adjust
      , cap_mid_y = y + h/2
      , cap_end_x = cap_x
      , cap_end_y = y + h

    r.g.text(x, y-12, title).attr({'font-size': '14px'})

    r.rect(x+0,         y, unit_w*10-space,       h).attr({fill: '#DCE6CC', stroke: 'none'});
    r.g.text(x, y+h+8, 'Optimal').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x, y+h+20, '0 mg/dL').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*10,    y, unit_w*3-space,     h).attr({fill: '#BDD1A0', stroke: 'none'});
    // adjust height for newline in text string
    r.g.text(x+unit_w*10,  y+h+15, 'Near\nOptimal').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*10,  y+h+35, '100 - 129').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*13,  y, unit_w*3-space,           h).attr({fill: '#A0BE78', stroke: 'none'});
    r.g.text(x+unit_w*13, y+h+15, 'Borderline\nhigh').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*13, y+h+35, '129 - 159').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*16,  y, unit_w*3-space,           h).attr({fill: '#86AD52', stroke: 'none'});
    r.g.text(x+unit_w*16, y+h+8, 'High').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*16, y+h+20, '160 - 189').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*19,  y, unit_w*11,           h).attr({fill: '#5E892B', stroke: 'none'});
    r.g.text(x+unit_w*19, y+h+8, 'Very High').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*19, y+h+20, '190+').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.path('M' + cap_x     + ' ' + cap_y +
           'L' + cap_mid_x + ' ' + cap_mid_y +
           'L' + cap_end_x + ' ' + cap_end_y +
           'z')
           .attr({'fill': '#5E892B', 'stroke': 'none'});

    var circle_x = (unit_w * (p.LDL.value / 10)) + x;
    r.circle(circle_x, y, 18).attr({'fill': '#F4804E', 'stroke': '#fff', 'stroke-width': '2px'});
    r.g.text(circle_x, y, parseInt(p.LDL.value)).attr({'font': '16px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'normal', 'fill': '#fff'})

    var title = 'HDL "good" cholesterol'
      , x = 140
      , y = 620 // 120px from above
      , w = 600
      , h = 30
      , units_n = 10 // max value 100
      , unit_w = w / units_n
      , space = 2
      , cap_x = w + x
      , cap_y = y
      , cap_mid_x = 760 - 10 // adjust
      , cap_mid_y = y + h/2
      , cap_end_x = cap_x
      , cap_end_y = y + h

    r.g.text(x, y-12, title).attr({'font-size': '16px'})

    r.rect(x+0,         y, unit_w*4-space,       h).attr({fill: '#A0BE78', stroke: 'none'});
    r.g.text(x, y+h+8, 'High risk').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x, y+h+20, '0 mg/dL').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*4,    y, unit_w*2-space,     h).attr({fill: '#86AD52', stroke: 'none'});
    r.g.text(x+unit_w*4,  y+h+8, 'Intermediate').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*4,  y+h+20, '40 - 59').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.rect(x+unit_w*6,  y, unit_w*4,           h).attr({fill: '#5E892B', stroke: 'none'});
    r.g.text(x+unit_w*6, y+h+8, 'Protective').attr({'font-size': '12px', 'font-weight': 'normal'})
    r.g.text(x+unit_w*6, y+h+20, '60+').attr({'font-size': '10px', 'font-weight': '200', 'fill': '#888'})

    r.path('M' + cap_x     + ' ' + cap_y +
           'L' + cap_mid_x + ' ' + cap_mid_y +
           'L' + cap_end_x + ' ' + cap_end_y +
           'z')
           .attr({'fill': '#5E892B', 'stroke': 'none'});

    var circle_x = (unit_w * (p.HDL.value / 10)) + x;
    r.circle(circle_x, y, 18).attr({'fill': '#F4804E', 'stroke': '#fff', 'stroke-width': '2px'});
    r.g.text(circle_x, y, parseInt(p.HDL.value)).attr({'font': '16px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'normal', 'fill': '#fff'})


    r.path("M10 700 L760 700").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'})
    r.circle(30, 720, 14).attr({'fill': '#F4804E', 'stroke': 'none'});
    r.g.text(30, 720, '3').attr({'font': '18px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'bold', 'fill': '#fff'})
    r.g.text(50, 720, 'Your risk').attr({'font-size': '18px', 'font-weight': 'bold'})
    r.g.text(50+100, 720, 'You show an elevated risk of cardiovascular disease')
      .attr({'font-size': '18px', 'font-weight': 'normal', 'fill': '#888'})
    r.risk_prelude = r.g.text(50, 780, 'If you\'re ' + (p.smoker_p.value ? '' : 'not ') +
     'a smoker with a blood pressure\n of ' + p.sbp.value + 'mm/Hg ' + (p.fx_of_mi_p.value ?
      'and have ' : 'and don\'t have ') +
      'a family\n history of heart attack before the age of 60\n (one or both parents) your risk over 10 years is:')
      .attr({'font-size': '14px', 'font-weight': 'normal', 'fill': '#888'})


    r.score_text = r.g.text(320, 780, score+'%')
      .attr({'font-size': '72px', 'font-weight': 'bold', 'fill': '#6A9C2D', 'font-family': "Consolas, monospace", 'font-weight': '900'})

    y = 750;
    r.g.text(450, y, 'Your risk would be lowered to:').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})

    r.score_if_sbp_of_10_lower_text = r.g.text(460, y+16, score_if_sbp_of_10_lower+'%').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.sbp_10_lower =  r.g.text(450+36, y+16, 'if your blood pressure were ' + sbp_10_lower + 'mm/Hg').attr({'font-size': '14px', 'fill': '#888'})

    r.score_if_all_optimal_text = r.g.text(460, y+32, score_if_all_optimal+'%').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.g.text(450+36, y+32, 'if you didn\'t smoke and all levels were optimal').attr({'font-size': '14px', 'fill': '#888'})


    r.if_you_quit_set.push(
      r.g.text(460, y+48, score_if_non_smoker+'%').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'}),
      r.g.text(450+36, y+48, 'if you quit smoking').attr({'font-size': '14px', 'fill': '#888'})
    );

    r.g.text(50, y+80, 'Use your test results to calculate your risk of a cardiovascular event at ReynoldsRisk.org')
      .attr({'font-size': '14px', 'font-weight': 'normal', 'fill': '#888'})

    r.path("M10 855 L760 855").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'})
    r.circle(30, 880, 14).attr({'fill': '#F4804E', 'stroke': 'none'});
    r.g.text(30, 880, '4').attr({'font': '18px Consolas, monospace', 'text-anchor': 'middle', 'font-weight': 'bold', 'fill': '#fff'})
    r.g.text(50, 880, 'What now?').attr({'font-size': '18px', 'font-weight': 'bold'})

    // 780px into 4 col grid. each col 180 + 15 right margin

    y = 900
    x = 30
    r.image("images/runner.png", x,     y, 45, 60);
    r.g.text(x+55, y+12, 'Diet and exercise').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.g.text(x+55, y+36, 'can improve your\ncholesterol levels').attr({'font-size': '14px', 'fill': '#888'})

    r.image("images/smoker.png", x+180, y, 45, 60);
    r.quit_text_1 = r.g.text(x+180+55, y+12, 'Staying smoke-free').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.quit_text_2 = r.g.text(x+180+55, y+36+8, 'is one of the best\nways to improve your\nheart disease risk').attr({'font-size': '14px', 'fill': '#888'})

    r.image("images/doctor.png", x+360, y, 45, 60);
    r.g.text(x+360+55, y+12, 'Ask your doctor').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.g.text(x+360+55, y+36+8, 'about statins or other\nmedications that can\nlower cholesterol').attr({'font-size': '14px', 'fill': '#888'})

    // some extra left margin here for systems without Calibri (ipad, etc.)
    r.image("images/needle.png", x+540+10, y, 45, 60);
    r.g.text(x+540+65, y+12, 'Consider retesting').attr({'font-size': '14px', 'font-weight': 'bold', 'fill': '#555'})
    r.g.text(x+540+65, y+36+8, 'in 1 or 2 weeks to\nexclude a temporary\nspike in blood levels').attr({'font-size': '14px', 'fill': '#888'})

    r.path("M10 980 L760 980").attr({'stroke-dasharray': '.', 'stroke-linecap': 'butt'})
    r.g.text(90, 1000, 'Original Design: David McCandless & Stefanie Posavec for Wired Magazine // informationisbeautiful.net')
      .attr({'font-size': '14px', 'fill': '#0088CC'})
      .click(function(e){window.open('http://www.informationisbeautiful.net/2010/visualizing-bloodtests/')})
      .hover(function(e){this.attr('cursor', 'pointer')}, function(e){this.attr('cursor', 'normal')})
    r.g.text(90, 1000+16, 'Reynolds Risk Score Calculator // ReynoldsRiskScore.org')
      .attr({'font-size': '14px', 'fill': '#0088CC'})
      .click(function(e){window.open('http://ReynoldsRiskScore.org')})
      .hover(function(e){this.attr('cursor', 'pointer')}, function(e){this.attr('cursor', 'normal')})
    r.g.text(90, 1000+48, 'Development and validation of improved algorithms for the assessment of global cardiovascular risk in women:\nThe Reynolds Risk Score. Ridker el al. JAMA 2007;297:611-619')
      .attr({'font-size': '12px', 'fill': '#0088CC'})
      .click(function(e){window.open('http://jama.ama-assn.org/content/297/6/611.long')})
      .hover(function(e){this.attr('cursor', 'pointer')}, function(e){this.attr('cursor', 'normal')})
    r.g.text(90, 1000+80, 'C-reactive protein and parental history improve global cardiovascular risk prediction: The Reynolds Risk Score for Men.\n Ridker et al. Circulation. 2008;118:2243-2251')
      .attr({'font-size': '12px', 'fill': '#0088CC'})
      .click(function(e){window.open('http://circ.ahajournals.org/cgi/content/full/118/22/2243')})
      .hover(function(e){this.attr('cursor', 'pointer')}, function(e){this.attr('cursor', 'normal')})
};
