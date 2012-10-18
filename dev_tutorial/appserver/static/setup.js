$(document).ready(function() {
    bindHandler();
});
function bindHandler() {
    $('.add-text').bind('click',function(event){addHandler(event);});
    $('.remove-text').bind('click',function(event){removeHandler(event);});
    $('.preview').bind('click',function(event){previewHandler(event);});
}
function addHandler(event) {
    var par  = $(event.target).parent();
    var gpar = par.parent();
    var name = $(event.target).parent().find('.dynamic-text').attr('name');
    var nwdd = document.createElement('dd');
    var inpt = document.createElement('input');
    inpt.setAttribute('class', 'dynamic-text');
    inpt.setAttribute('type', 'text');
    inpt.setAttribute('name', name);
    var remv = document.createElement('button');
    remv.setAttribute('class', 'remove-text');
    remv.innerHTML = 'remove';
    $(remv).bind('click', function(event){removeHandler(event);});
    var add = document.createElement('button');
    add.setAttribute('class', 'add-text');
    add.innerHTML = 'add new';
    $(add).bind('click', function(event){addHandler(event);});
    nwdd.appendChild(inpt);
    nwdd.appendChild(remv);
    nwdd.appendChild(add);
    gpar[0].appendChild(nwdd);
    $(event.target).remove();
    if (par.children('button').length < 1) {
        var remv = document.createElement('button');
        remv.setAttribute('class', 'remove-text');
        remv.innerHTML = 'remove';
        $(remv).bind('click', function(event){removeHandler(event);});
        par.get(0).appendChild(remv); 
    }
    return false;
}
function removeHandler(event) {
    /* 
     *  1) this is the second to last element
     *  2) this is the last of several elements
     *  3) this is the first element
     */
    var par  = $(event.target).parent();
    var gpar = par.parent();
    var name = $(event.target).parent().find('.dynamic-text').attr('name');
    var ancs = gpar.children().length-1;
    var ntype = $(event.target).next().attr('type'); 
    if (ntype === 'submit' || ntype === 'button') {
        if (ancs === 1) {
            par.prev().children('.remove-text').remove();
        }
        var add = document.createElement('button');
        add.setAttribute('class', 'add-text');
        add.innerHTML = 'add new';
        $(add).bind('click', function(event){addHandler(event);});
        par.prev().get(0).appendChild(add);
    } else {
        if (ancs === 1) {
            par.next().children('.remove-text').remove();
        }
    }
    par.remove();
    return false;
}
function previewHandler(event) {
    var name;
    var value;
    var values = [];

    var log_value = document.getElementsByName('eventtype.web-traffic.search')[0].value; 
    var sibs = $(event.target).prev().get(0).childNodes;
    for (var i = 0; i < sibs.length; i++) {
        if (sibs[i].hasChildNodes()) {
            var nodes = sibs[i].childNodes;
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].className === 'dynamic-text') {
                    values.push(nodes[j]);
                } 
            } 
        }
    }
    if (values.length>0) {
        name = values[0].name.split('.')[1];
        value = [log_value, _dynValFact(name, values)].join(' ');
    } else {
        name = $(event.target).prev().attr('name');
        if (name === 'eventtype.web-traffic.search') {
            value = log_value;
        } else {
            value = [log_value, $(event.target).prev().val()].join(' ');
        }
    }
    if (value.length > 0) {
        range = new Splunk.TimeRange('-1d','now');
	value = value.concat(' | head 20');
        search = new Splunk.Search(value, range);
        var options = {}; 
        options['windowFeatures'] = this.DEFAULT_WINDOW_FEATURES;
        search.sendToView('flashtimeline', {}, false, true, options, 'webintelligence');
        return false;
    } else {
        return false;
    }   
    return false;
}
function _dynValFact(name, values) {
    var out = [];
    var output;
    var keys = {'clientip-internal': ['clientip'], 'internal-domain': ['referer_domain'],
                'brand-name': ['q', 'p'], 'exclude-pageview': ['uri', 'file']}
    var keyList = keys[name];
    for (var i=0; i<values.length; i++) {
        var value = values[i].value;
        var stub = [];
        if (value && value != '' && value != null) {
            for (var j=0; j < keyList.length; j++) {
                stub.push([keyList[j], value].join('='));
            }
            out.push(stub.join(' OR '));
        } 
    }
    output = out.join(' OR ');
    return output; 
}
