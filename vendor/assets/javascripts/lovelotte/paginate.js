/**
 * Paginates a list: 
 */
;

(function($){
    var data_key = "paginate_obj";
    
    var defaults = {
        'list-els': 'tbody tr',
        'list-params': 'td',
        'num': 10,
        'buttons': {
            'next': '',
            'prev': '',
            'start': '',
            'end': ''
        }
    };    
    
    /**
     * Initialization
     * @param {object} options
     * @param {jQuery} dom
     */
    $.paginate = function(options, dom){
        this.options = $.extend({}, defaults, options);
        this.$this = $(dom);
        this.st = 0; 
        this.sh = []; //show!
        
        this.cnt = this.$this.find(this.options['list-els']).size();
        this.en = this.cnt; 
        
        this.start(); 
        
        var __this = this, btn = this.options.buttons;
        
        //Add event triggers to buttons
        for( var key in btn ){
            if( !btn[key] ) return;
            
            var obj = null;
            if( btn[key] instanceof $ ){obj = btn[key];}
            else if( btn[key] != "" ){
                obj = this.$this.find(btn[key]);
            }
            
            switch(key){
                case 'start': obj.click(function(){ __this.start(  ); }); break;
                case 'end': obj.click(function(){ __this.end( ); }); break;
                case 'next': obj.click(function(){ __this.next( ); }); break;
                case 'prev': obj.click(function(){ __this.prev( ); }); break;
            }
        }
        
    };
    
    $.paginate.prototype.add = function(){
        this.cnt++; //adds a row! 
    };
    
    $.paginate.prototype.delete = function(){
        this.cnt--;
    };
    
    $.paginate.prototype.stats=function(){
        return [this.st, this.en, this.sh.length, this.cnt];
    };
    
    $.paginate.prototype.setSkipped = function(s){
        if( s.length == 0){
            this.sh = []; //empty it! 
            return;
        }
        
        var show = []; //sets show!
        for(var i=0; i<this.cnt; i++){
            if( !$.inArray(i, s) ) show.push(i);            
        }
                        
        this.sh = show;        
        this.reset();
    };
    
    $.paginate.prototype.setShown = function(s){
        this.sh = s; 
        this.reset();
    };
    
    /**
     * Set the number to be viewed at one time.
     * @param {type} num
     * @returns {undefined}
     */
    $.paginate.prototype.setNum = function(num){
        this.options.num = num;
        this.from( this.st );
    };
    
    /**
     * For those that want to continue with the jQ object
     * @returns {jQuery object}
     */
    $.paginate.prototype.$get = function(){
        return this.$this; 
    };
    
    /**
     * Re-paginate with current page; 
     */
    $.paginate.prototype.reset = function(){
        this.$this.find(this.options['list-els']).addClass('hidden'); //hide all!
        this.en = 0; 
        this.from(this.st);
    };
    
    /**
     * Shows next elements
     */
    $.paginate.prototype.next = function(){ this.from(this.en+1); };
    
    /**
     * Shows previous elements
     */
    $.paginate.prototype.prev = function(){ this.from(this.st-this.options.num); };
    
    /**
     * Shows starting elements
     */
    $.paginate.prototype.start = function(){ this.from(0); };
    
    /**
     * Shows ending elements
     */
    $.paginate.prototype.end = function(){ this.from(this.cnt); };
    
    /**
     * Shows between the indices
     * @param {int} start
     */
    $.paginate.prototype.from = function(start){
        var $els = this.$this.find(this.options['list-els']);
        var cnt = this.sh.length? this.sh.length: this.cnt;
        
        //Get proper starting value
        if( start < 0 ) start = 0; 
        else if (start != 0){
            var end = cnt - (cnt % this.options.num);
            if( end == cnt ) end -= this.options.num;        
            if( start > end ) start = end;             
        }
        
        //If start value is farther than previous, hide previous
        if( start > 0 && start >= this.st ){
            $els.slice(this.st, start).addClass('hidden'); 
        }
        
        //Show current;
        var i,
            end = start + this.options.num; 
        if( end > cnt ) end = cnt; 
        
        for(i=start; i<end /*&& num<total*/; i++){
            if( this.sh.length ){
                $els.eq( this.sh[i] ).removeClass('hidden');
            }else{
                $els.eq(i).removeClass('hidden');
            }
        }
        
        //Hide what needs to be hidden *after* the current showing list; 
        if( i < this.en ){
            for(var j=i; j<this.en; j++){
                if( this.sh.length ) $els.eq(this.sh[j]).addClass('hidden');
                else $els.eq(j).addClass('hidden');
            }
        }
        
        //Update vars
        this.st = start; 
        this.en = i-1; 
        
        this.$this.trigger('page-change', [start, this.en, this.sh]);
    };
    
    $.fn.paginate = function(options){
        if( $(this).length == 1){
            var l = $(this).data(data_key); 
            if( l instanceof $.paginate ) return l; 
            
            l = new $.paginate(options, this);
            $(this).data(data_key, l); 
            return l; 
        }else{
            var arr = [];
            $(this).each(function(){ arr.push( $(this).paginate(options, this)); });
            return arr;
        }        
    };
    
})(jQuery); 