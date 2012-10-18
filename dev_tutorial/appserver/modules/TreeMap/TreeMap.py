#
# Splunk UI module python renderer
# This module is imported by the module loader (lib.module.ModuleMapper) into
# the splunk.appserver.mrsparkle.controllers.module.* namespace.
#

import cherrypy
import controllers.module as module

import splunk, splunk.search, splunk.util, splunk.entity
import json
from splunk.appserver.mrsparkle.lib import jsonresponse
import lib.util as util
import lib.i18n as i18n

import logging
logger = logging.getLogger('splunk.module.TreeMap')

import math
import cgi

class TreeMap(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, count=1000, 
            offset=0, entity_name='results'):

        count = max(int(count), 0)
        offset = max(int(offset), 0)
        if not sid:
            raise Exception('TreeMap.generateResults - sid not passed!')

        try:
            job = splunk.search.getJob(sid)
        except splunk.ResourceNotFound, e:
            logger.error('TreeMap could not find job %s. Exception: %s' % (sid, e))
            return _('<p class="resultStatusMessage">Could not get search data.</p>')
        
        dataset = getattr(job, entity_name)[offset: offset+count]

        outputJSON = {}
        for i, result in enumerate(dataset):
            tdict = {}
            tdict[str(result.get('processor', None))] = str(result.get('totalCPU', None))
            name = str(result.get('name', None))
            if name not in outputJSON:
                outputJSON[name] = dict()
            outputJSON[name].update(tdict)

        cherrypy.response.headers['Content-Type'] = 'text/json'
        return json.dumps(outputJSON, sort_keys=True)
#        return self.render_json(outputJSON)
        
    def render_json(self, response_data, set_mime='text/json'):
        cherrypy.response.headers['Content-Type'] = set_mime

        if isinstance(response_data, jsonresponse.JsonResponse):
            response = response_data.toJson().replace("</", "<\\/")
        else:
            response = json.dumps(response_data).replace("</", "<\\/")

        # Pad with 256 bytes of whitespace for IE security issue. See SPL-34355
        return ' ' * 256  + '\n' + response
