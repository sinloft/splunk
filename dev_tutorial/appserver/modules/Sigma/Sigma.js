// A treemap renderer
Splunk.Module.Sigma = $.klass(Splunk.Module.DispatchingModule, {

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
            console.debug("Mir probiere no mau");
var sigRoot = document.getElementById('SigmaID');
var sigInst = sigma.init(sigRoot);
sigInst.addNode('hello',{
  label: 'Hello',
  color: '#ff0000'
}).addNode('world',{
  label: 'World !',
  color: '#00ff00'
}).addEdge('hello_world','hello','world').draw();
var test = "";
        for (var key in results)  {
            test+="key = "+key+", val = "+results[key]%+"\n";
	}
            console.debug(test);
/*
            console.debug("sodeli rendere bitte");
        this.resultsContainer.html(test); 
*/
    }
})

