// A simple results table
Splunk.Module.CustomJSONResults = $.klass(Splunk.Module.DispatchingModule, {

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
        
        for (var key in results) {
            console.debug("key = %s, val = %s", key, results[key]);
        }
        
        htmlFragment = '<div class="CustomResultsTableWrapper">';
        htmlFragment += '<table class="CustomResultsTable splTable">';
        for (var key in results) {
            htmlFragment += '<tr>';
            htmlFragment += '<td>' + key  + '</td><td>' + results[key]  + '</td>';
            htmlFragment += '</tr>';
        }
        htmlFragment += '</table></div>';
        this.resultsContainer.html(htmlFragment);
    }
})
