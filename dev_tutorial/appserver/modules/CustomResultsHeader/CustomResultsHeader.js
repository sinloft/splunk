Splunk.Module.CustomResultsHeader = $.klass(Splunk.Module, {
    
    initialize: function($super, container) {
        $super(container);
        this._customName = this._params["customName"]   || "(required parameter unset)";
        
        $(".customResultsHeader", this.container).text(this._customName);
    }
});
