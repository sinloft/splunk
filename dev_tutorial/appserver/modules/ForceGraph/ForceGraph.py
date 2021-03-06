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
logger = logging.getLogger('splunk.module.ForceGraph')

import math
import cgi

class ForceGraph(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, count=1000, 
            offset=0, entity_name='results'):

        count = max(int(count), 0)
        offset = max(int(offset), 0)
        if not sid:
            raise Exception('ForceGraph.generateResults - sid not passed!')

        try:
            job = splunk.search.getJob(sid)
        except splunk.ResourceNotFound, e:
            logger.error('ForceGraph could not find job %s. Exception: %s' % (sid, e))
            return _('<p class="resultStatusMessage">Could not get search data.</p>')

        fieldNames = [x for x in getattr(job, entity_name).fieldOrder if (not x.startswith('_'))]
        logger.info(fieldNames)
        logger.info(len(fieldNames))
        if len(fieldNames) < 2:
            msg = 'JitGraph needs at least 2 non-internal fields to draw a graph'
            cherrypy.response["message"] = msg
            cherrypy.response["success"] = False
            logger.error(msg+fieldNames)
            raise Exception(msg)

        
        dataset = getattr(job, entity_name)[offset: offset+count]

        results = []
        
        limit = 2 if len(fieldNames) > 2 else 1
        logger.info("Range is"+str(limit))
        #Macht nodes an pos 0+1 und 1+2
        for j in range(0,limit):

            for i, result in enumerate(dataset):
                link = {}
                src = str(result.get(fieldNames[j]))
                dst = str(result.get(fieldNames[j+1]))
                action = str(result.get("action"))
                link["source"]=src
                link["target"]=dst
                if action:
                    link["type"]=action
                else:
                    link["type"]="default"
                results.append(link)
            
        logger.info(results)

        cherrypy.response.headers['Content-Type'] = 'text/json'
        return json.dumps(results, sort_keys=True)
#        return self.render_json(outputJSON)
        
    def render_json(self, response_data, set_mime='text/json'):
        cherrypy.response.headers['Content-Type'] = set_mime

        if isinstance(response_data, jsonresponse.JsonResponse):
            response = response_data.toJson().replace("</", "<\\/")
        else:
            response = json.dumps(response_data).replace("</", "<\\/")

        # Pad with 256 bytes of whitespace for IE security issue. See SPL-34355
        return ' ' * 256  + '\n' + response
