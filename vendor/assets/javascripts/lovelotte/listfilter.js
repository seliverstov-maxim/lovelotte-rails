/**
 * The MIT License
 */

;
(function($){
    
    var data_key = "listFilter_obj";
    
    var defaults = {
        /*'list-wrapper': 'table',
        'list-header': 'thead th',*/
        'list-els': 'tbody tr',
        'list-params': 'td',
        'getValue': getValue,
        'min-chars': 3,
        'interval': 15,
        'num-rows': 1000
    };
        
    /**
     * Filter initializer
     * @param {jQ} input - that has search text / params
     * @param {jQ} list - to be filtered
     * @param {object} options
     */
    $.listFilter = function(input, list, options){   
        this.$input = $(input);
        this.isInput = this.$input.is('input, textarea');
        this.options = $.extend({}, defaults, options);
        this.setList(list);
        
        this.getValFunc = ( $.isFunction( this.options.getValue ) )? 
            this.options.getValue : defaults.getValue;
        
        createFilterElement.call(this);
        
        var __this = this;
        this.$input.keyup( function(){ __this.filter(); });
        
        //filtering state
        this.state = {
            prev: '',
            row: 0,
            tout: null,
            sel: [],
            skip: [],
            skipInds: [], //skip indices
            currIndexSkip: 0 //current index in skip
        };
    };
    
    $.listFilter.prototype.setList = function(list, options){
        if( options ) this.options = $.extend({}, this.options, options);
        
        this.$list = $(list);
        this.$listEls = this.$list.find( this.options['list-els'] );        
    };
    
    $.listFilter.prototype.defaultActions = function(){
        this.$input.on('showAll.listfilter', function(e, input, list){
            list.removeClass('hidden');
        }).on('filtered.listfilter', function(e, sel, skip){
            var ns = sel.length, nn = skip.length;
            for(var i=0; i<ns; i++) sel[i].removeClass('hidden');
            for(var i=0; i<nn; i++ ) skip[i].addClass('hidden');
        });
    };
    
    /**
     * Creates a filtering element
     */
    function createFilterElement(){
        this.$input.addClass('listFilter');
        if( this.isInput ) return; 
        
        this.$input.attr('contenteditable', true);
        
        var defaultText = this.$input.text();
        this.$input.click(function(){ $(this).html('').removeClass('filter'); }).keydown(function(){
            var val = $(this).text().trim();
            if( val ) $(this).addClass('filter'); 
            else $(this).removeClass('filter');
        }).blur($.proxy(function(){
            if( this.$input.text() == "" ){
                this.$input.html(defaultText).trigger('showAll.listfilter', [this.$input, this.$listEls]);                
            }
        }, this));
        
    }
    
    /**
     * Performs filtering
     */
    $.listFilter.prototype.filter = function(val){        
        if( !val ) val = this.getFilter(); 
        if( val.length < this.options['min-chars'] ){
            this.$input.trigger('showAll.listfilter', [this.$input, this.$listEls]);
            return;
        } 
        
        //determine relationship with prev val
        var r = val.search( this.state.prev ) === 0; //must start with previous value
        this.stopFilter( !r && this.state.tout, false ); //if new, or no interval, reset; else keep skip
        
        this.state.prev = val; 
        this.state.tout = setInterval( $.proxy(filterRow, this) , this.options.interval); //every 10 ms go through 1000 row; 
        
        //start the timeout
        this.$input.addClass('filtering').trigger('filtering.listfilter', this.$input, this.$list);
    };
    
    $.listFilter.prototype.stopFilter = function(n, t){      
        clearTimeout(this.state.tout);
        this.$input.removeClass('filtering');
        
        if( t ) this.$input.trigger('filtered.listfilter', [this.state.sel.slice(), this.state.skip.slice()] );
        
        if( n ){
            this.state.skip = []; //remove skipped if showing everything! 
            this.state.skipInds = [];             
        }

        this.state.sel = []; 
        this.state.row = 0;  
        this.state.currIndexSkip = 0; 
    };

    /**
     * Adds a row to the skipped arrays
     * @param {type} el
     * @param {type} row
     * @returns {undefined}
     */
    function addSkipped(el, row){
        this.state.skip.push( el );
        this.state.skipInds.push( row );
    }

    /**
     * Checks if a row is skipped
     * @returns {undefined}
     */
    function isSkipped(){
        //SkipInds is always going to be "sorted" because we add it in an ascending manner. So just need to check current one.
        if( this.state.skipInds.length == 0 || this.state.skipInds.length <= this.state.currIndexSkip) return false; //nothing in array so it isn't skipped; 
        //or else we've gone through all of the indices
        
        if( this.state.row > this.state.skipInds[this.state.currIndexSkip] ){
            this.state.currIndexSkip++;
            return isSkipped.call(this);
        } //it shouldn't happen, but it might. 
        else if( this.state.row == this.state.skipInds[this.state.currIndexSkip]) return true; 
        else return false; 
    }
    
    /**
     * Filters the current row
     * @returns {undefined}
     */
    function filterRow(i){
        if( !i ) i=0; 
        
        var is, val = this.state.prev, getVal = this.getValFunc
        , curr = this.$listEls.eq(this.state.row); 
        
        var __this = this;
        
        var $params = curr.find( this.options['list-params'] );
        if( $params.length == 0 ) $params = curr; 
        
        $params.each(function(){
            var v = __this.getValFunc.call( this ).toLowerCase().replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
            if( v && v.search( val.toLowerCase() ) != -1 ){
                is = true;  return false; 
            }
        });
        
        is? this.state.sel.push( curr ) : addSkipped.call(this, curr, this.state.row); //this.state.skip.push(this); 

        do{
            this.state.row++;         
        }while( isSkipped.call(this) ); //while skip doesn't have the row; 
        
        if( this.state.row == this.$listEls.length ) this.stopFilter(false, true); 
        else if( i < this.options['num-rows'] ) filterRow.call(this, i+1);
    }
    
    /**
     * Returns a filter value
     * @returns {string}
     */
    $.listFilter.prototype.getFilter = function(){
        return this.isInput? this.$input.val().trim() : this.$input.text().trim();        
    };
    
    $.fn.listFilter = function(list, options){
        if( $(this).length === 1){
            var l = $(this).data(data_key); 
            if( l instanceof $.listFilter ) return l; 
            
            l = new $.listFilter(this, list, options);
            $(this).data(data_key, l); 
            return l; 
        }else{
            var arr = [];
            $(this).each(function(){ arr.push( $(this).listFilter(this, list, options)); });
            return arr;
        } 
    };
    
    /**
     * Gets the value of the list element (param). 
     */
    function getValue(){
        var $input = $(this).find('input, textarea');
        
        if( $input.size() ) return $input.val().trim(); 
        else return $(this).text().trim(); 
    }   
  
})(jQuery);