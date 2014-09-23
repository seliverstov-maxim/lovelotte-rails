/** The MIT License (MIT) */;

/**
 * Scrollbar for use when parent has overflow:hidden. Requires two step div. 
 * <div outer> <- overflow: hidden;
 *  <div inner> <- overflow: visible|initial; //no scrollbar. 
 *     ... elements
 *  </div inner>
 * <div outer>
 * 
 * @param {type} $
 * @returns {undefined}
 */

(function($){
   var data_key = "scrollbar";
   
   var $bars = $("<div/>").addClass('scrollbar'); 
   var $vert = $bars.clone().addClass('vertical');
   var $horz = $bars.clone().addClass('horizontal');
   
   //TODO: add classes
   var defaults = {
       h: 1,
       v: 1,
       autoHide: 1,
       grow: 0,
       growBy: 5
   };
   
   var dragJs = 'drag.js'; //location of drag.js
   
   /**
    * Scrollbar
    * @param {type} el - element that needs scrollbars
    * @param {array} opts - options
    */
    $.scrollbar = function(el, opts){
        this.o = $.extend({}, defaults, opts);
        this.$t = $(el);
        this.$p = this.$t.parent();
        this.dragging = false;
        
        if( this.o.h ){
            this.$h = $horz.clone();
            this.$p.append(this.$h);                                 
        }
        
        if( this.o.v ){
            this.$v = $vert.clone();
            this.$p.append(this.$v);                                                
        }

        this.reset(); //set height and width

        //add event listener to parent
        if( this.o.autoHide ){
            this.$p.hover($.proxy(this,'show'), $.proxy(this,'hide'));  
        }else{
            this.show();
        }
        
        if( this.o.grow ){
            var growBy = this.o.growBy; 
            if( this.$v ) this.$v.mouseover(function(){ $(this).css('width', '+=' + growBy); }).mouseout(function(){ $(this).css('width', '-=' + growBy); });
            if( this.$h ) this.$h.mouseover(function(){ $(this).css('height', '+=' + growBy); }).mouseout(function(){ $(this).css('height', '-=' + growBy); });
        }

        //allow drag if file exists
        //$.loadJs(dragJs, $.proxy(implementDrag, this) );   
        implementDrag.call(this);
        
    };

    function implementDrag(){    
        if( this.$v ){
            this.$v.drag({dir:1, max: this.$p.height()-this.h});
            this.$v.on('drag::dragStart', $.proxy(dragStart, this))
                   .on('drag::dragStop', $.proxy(dragStop, this))
                   .on('drag::dragging', $.proxy(draggingY, this));            
        }
        
        if( this.$h ){
            this.$h.drag({dir:0, max: this.$p.width()-this.w});
            this.$h.on('drag::dragStart', $.proxy(dragStart, this))
               .on('drag::dragStop', $.proxy(dragStop, this))
               .on('drag::dragging', $.proxy(draggingX, this));
        }        
    }

    function dragStart(){ this.dragging = true; };
    function dragStop(){ this.dragging = false; };
    function draggingX(ev, dx, dy){ 
        var pdx = dx / (this.$p.width() - this.w); 
        this.$t.trigger('scrollbar::dragX', [pdx]); 
    };
    
    function draggingY(ev, dx, dy){ 
        var pdy = dy / (this.$p.height() - this.h); 
        this.$t.trigger('scrollbar::dragY', [pdy]); 
    };

    /**
     * Shows the scrollbar
     */
    $.scrollbar.prototype.show = function(){
        if( this.o.v ) this.$v.animate({opacity: 1}, 50);
        if( this.o.h ) this.$h.animate({opacity: 1}, 50);
        this.$t.trigger('scrollbar::show', [this.$v, this.$h]);
    };

    /**
     * Hides the scrollbar
     */
    $.scrollbar.prototype.hide = function(){
        if( this.dragging ) return; 
        if( this.o.v ) this.$v.animate({opacity: 0}, 50);
        if( this.o.h ) this.$h.animate({opacity: 0}, 50);
        this.$t.trigger('scrollbar::hide', [this.$v, this.$h]);
    };
    
    $.scrollbar.prototype.reset = function(){
        var p = this.$p.css('position');
        if( !p || p == 'static' ) this.$p.css('position', 'relative');

        if(this.o.v){
            var h=this.$p.height(), hi=this.$t.height();
            if( hi > h ){
                this.h = h/hi*h;
                this.$v.css('height', this.h);
            }
        }
        
        if( this.o.h ){
            var w=this.$p.width(), wi=this.$t.width();
            if( wi > w ){
                this.w = w/wi*w;
                this.$h.css('width', this.w);
            }
        }     
    };

    /**
     * Updates the scrollbars. 
     * @param {double} x - horizontal % (integer from 0-1)
     * @param {double} y - vertical % (integer from 0-1)
     */
    $.scrollbar.prototype.update = function(x, y){        
        if( y < 0 ) y=0; if( x < 0 ) x=0;
        if( y > 1 ) y=1; if( x > 1 ) x=1;
        
        if( this.o.v && this.$v ){            
            var t = (this.$p.height() - this.h)*y;
            this.$v.css({ top: t });
        }
        
        if( this.o.h && this.$h ){
            var l = (this.$p.width()-this.w)*x;
            this.$h.css({left: l});
        }        
    };

    $.fn.scrollbar = function(opts){
        if( $(this).length != 1 ){
            var arr = [];
            $(this).each(function(){
                arr.push( $(this).scrollbar(this, opts) );
            });
            return arr; 
        }

        var l = $(this).data(data_key); 
        if( l instanceof $.scrollbar ) return l;

        l = new $.scrollbar(this, opts);
        $(this).data(data_key, l);
        return l;         
    };
    
})(jQuery);