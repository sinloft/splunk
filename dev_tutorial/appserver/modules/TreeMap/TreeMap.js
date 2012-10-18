// A treemap renderer
// another comment
Splunk.Module.TreeMap = $.klass(Splunk.Module.DispatchingModule, {

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.myParam = this.getParam("myParam");
        this.resultsContainer = this.container;
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
/*        
        for (var key in results) {
            console.debug("key = %s, val = %s", key, results[key]);
        }
*/
        var re = "",
            color = pv.Colors.category19().by(function(d) d.parentNode.nodeName)
            nodes = pv.dom(results).root("flare").nodes();
        
        var vis = new pv.Panel()
            .width(920)
            .height(420)
            .canvas(document.getElementById('TreeMapID'));
        /*    .canvas($('#TreeMapID')[0]); */ 
        
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
/*        this.resultsContainer.html(htmlFragment); */
    }
})

