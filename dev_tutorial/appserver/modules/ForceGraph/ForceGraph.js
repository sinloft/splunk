// A treemap renderer
Splunk.Module.ForceGraph= $.klass(Splunk.Module.DispatchingModule, {

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

       //remove the svg
        elements = document.getElementById("ForceGraphID").getElementsByTagName("svg");
        console.debug(elements);
        if( elements.length > 0){
              elements[0].parentNode.removeChild(elements[0]);
        }


var links = results;
var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  var source = link.source;
  var target = link.target;
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,in_count: 0, out_count: 0});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,in_count: 0, out_count: 0});
  nodes[source].out_count++;
  nodes[target].in_count++;
});

var w = this.resultsContainer.context.scrollWidth;
    h = this.resultsContainer.context.scrollHeight;

//initiale position der knoten
var n = nodes.length;
d3.values(nodes).forEach(function(d, i) {
  d.x = d.y = w / n * i;
});

console.debug(w);
console.debug(h);

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(80)
    .charge(-300)
    .on("tick", tick)
    .start();

//Stolen from: http://bl.ocks.org/2883411
var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        //force.resume();
    }



var svg = d3.select("#ForceGraphID").append("svg:svg")
    .attr("width", this.getParam("width"))
    .attr("height", this.getParam("height"));

// Per-type markers, as they don't inherit styles.
svg.append("svg:defs").selectAll("marker")
    .data(["None", "ok", "nok","success","failure","allowed","blocked"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -10 20 20")
    .attr("refX", 25)
    .attr("refY", -1.5)
    .attr("markerWidth", 12)
    .attr("markerHeight", 12)
    .attr("orient", "auto")
    .attr("markerUnits", "userSpaceOnUse")
  .append("svg:path")
    .attr("d", "M0,-10L20,0L0,10");

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
    .style("stroke-width", function(d) { return Math.min(Math.sqrt(d.count),4); });

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", 6)
    //.append("svg:title")
    //  .text(function(d, i) { return "Connections in " + d.count; })
    //.on("mouseover", function(){return tooltip.style("visibility", "visible");})
    //.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    //.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
    .call(node_drag);
    //.call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name+" (in "+d.in_count+" out "+d.out_count+")"; });

text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name+" (in "+d.in_count+" out "+d.out_count+")"; });

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}


/*        this.resultsContainer.html(htmlFragment); */
    }
})

