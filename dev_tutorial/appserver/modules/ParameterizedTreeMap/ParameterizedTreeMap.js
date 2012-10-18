// A treemap renderer
Splunk.Module.ParameterizedTreeMap = $.klass(Splunk.Module.DispatchingModule, {

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.resultsContainer = this.container;
        this.tmapHeight = this.getParam('tmapHeight', 920);
        this.tmapWidth = this.getParam('tmapWidth', 420);
    },

    onJobDone: function(event) {
        this.getResults();
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search = context.get("search");
        var sid = search.job.getSearchId();

        if (!sid) this.logger.error(this.moduleType, "Assertion Failed.");

        params.sid = sid;
        return params;
    },

    renderResults: function($super, results) {

        if(!results) {
	    this.resultsContainer.html('No content available.');
            return;
        }

        var re = "",
            color = pv.Colors.category19().by(function(d) d.parentNode.nodeName)
            nodes = pv.dom(results).root("flare").nodes();
        
        var vis = new pv.Panel()
            .width(this.tmapWidth)
            .height(this.tmapHeight)
            .canvas(document.getElementById('ParameterizedTreeMapID'));
        /*    .canvas($('#ParameterizedTreeMapID')[0]); */ 
        
        var treemap = vis.add(pv.Layout.Treemap)
            .nodes(nodes)
            .round(true);
        
        treemap.leaf.add(pv.Panel)
            .fillStyle(function(d) color(d).alpha(1))
            .strokeStyle("#fff")
            .lineWidth(1)
            .antialias(false);
        
        treemap.label.add(pv.Label)
            .textStyle(function(d) pv.rgb(0, 0, 0, 1));
        
        vis.render();
    }
})

