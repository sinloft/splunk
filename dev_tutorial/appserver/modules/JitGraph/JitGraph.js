// A treemap renderer
Splunk.Module.JitGraph = $.klass(Splunk.Module.DispatchingModule, {

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
    getResultsErrorHandler: function(xhr, textStatus, exception) {
        if (xhr.status >= 404) {
            var errorMsg = _('An error was returned: "%(statusText)s".');
            var errorVars = {status: xhr.status, statusText: xhr.statusText};
            this.displayInlineErrorMessage(sprintf(errorMsg, errorVars));
        }  
    },
     /**
     * Current version of jQuery ui is buggy. Additional logic to make things work consistently.
     */
    enableResizable: function() {
        if (!($.browser.safari && $.browser.version < "526")) {  // disable resizing for safari 3 and below only
            $("div.JitGraphResults", this.container).resizable({autoHide: true, handles: "s", stop: this.onResizeStop.bind(this)});
            $("div.JitGraphResults").mouseup(  // workaround until jquery ui is updated
                function(event) {
                    $(this).width("100%");
                }
            );
        }
    },
   /**
     * Handle a resize stop event from the Resizable jQuery extension. See http://docs.jquery.com/UI/Resizable
     * Saves the new height with a "px" suffix to viewstate.conf.
     *
     * @param {Object} event Original browser event.
     * @param {Object} ui Prepared ui object having the following attributes: http://docs.jquery.com/UI/Resizable#overview
     */
    onResizeStop: function(event, ui) {
        $(event.target).width("100%");
        this.setParam("height", ui.size.height + "px");
    },



    renderResults: function($super, results) {

        console.debug("starting");

        if(!results) {
	    this.resultsContainer.html('No content available.');
            return;
        }
        console.debug("Printing key value pairs");
        for (var key in results) {
            console.debug("key = %s, val = %s", key, results[key]);
        }
        console.debug("Done printing key value pairs");

//remove children from our div (in case this is a refresh )
//not very elegant I know
var cell = document.getElementById("JitGraphID");

if ( cell.hasChildNodes() )
{
    while ( cell.childNodes.length >= 1 )
    {
        cell.removeChild( cell.firstChild );       
    } 
}

//start
var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();




  var json = [
      {
        "adjacencies": [
            "graphnode21", 
            {
              "nodeTo": "graphnode1",
              "nodeFrom": "graphnode0",
              "data": {
                "$color": "#557EAA"
              }
            }
        ],
        "data": {
          "$color": "#83548B",
          "$type": "circle",
          "$dim": 10
        },
        "id": "graphnode1",
        "name": "graphnode1"
      },
      {
        "adjacencies": [
            {
              "nodeTo": "graphnode1",
              "nodeFrom": "graphnode0",
              "data": {
                "$color": "#555555"
              }
            }
        ],
        "data": {
          "$color": "#83548B",
          "$type": "circle",
          "$dim": 10
        },
        "id": "graphnode1",
        "name": "graphnode1"
      },
      {
        "data": {
          "$color": "#83548B",
          "$type": "circle",
          "$dim": 10
        },
        "id": "graphnode2",
        "name": "graphnode2"
      },


        ];
  // end
  // init ForceDirected
  var fd = new $jit.ForceDirected({
    //id of the visualization container
    injectInto: 'JitGraphID',
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 10 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 0.5,
      type: 'arrow'
    },
    //Native canvas text styling
    Label: {
      type: labelType, //Native or HTML
      size: 10,
      //style: 'bold',
      color: '#483D8B'
    },
    //Add Tips
    Tips: {
      enable: true,
      onShow: function(tip, node) {
        //count connections
        var count = 0;
        var count_all = 0;
        node.eachAdjacency(function() { count++; });
        node.eachAdjacency(function(adj) {  
          count_all+=(adj.data.connections)
        });  
        //display node info in tooltip
        tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
          + "<div class=\"tip-text\"><b>dist connections:</b> " + count + "</div>"
          + "<div class=\"tip-text\"><b>total connections:</b> " + count_all + "</div>";
      }
    },
    // Add node events
    Events: {
      enable: true,
      type: 'Native',
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
          fd.plot();
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        $jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      },
      //Add also a click handler to nodes
      onClick: function(node) {
        if(!node) return;
        // Build the right column relations list.
        // This is done by traversing the clicked node connections.
        var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
            list = [];
        node.eachAdjacency(function(adj){
          list.push(adj.nodeTo.name);
        });
        //append connections information
        $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 80,
    //Edge length
    levelDistance: 100,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#ddd";
    },
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = (top + 10) + 'px';
      style.display = '';
    }
  });
  // load JSON data.
  //fd.loadJSON(json);
  console.debug(results);
  fd.loadJSON(results);
  // compute positions incrementally and animate.
  fd.computeIncremental({
    iter: 20,
    property: 'end',
    onStep: function(perc){
      console.debug(perc + '% loaded...');
    },
    onComplete: function(){
      console.debug('done');
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });
  // end

       /* this.resultsContainer.html("Test");*/ 
    }
})

