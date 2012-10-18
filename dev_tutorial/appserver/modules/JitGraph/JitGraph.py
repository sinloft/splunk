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
logger = logging.getLogger('splunk.module.JitGraph')

import math
import cgi

class JitGraph(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, count=1000, 
            offset=0, entity_name='results'):

        count = max(int(count), 0)
        offset = max(int(offset), 0)
        if not sid:
            raise Exception('JitGraph.generateResults - sid not passed!')

        try:
            job = splunk.search.getJob(sid)
        except splunk.ResourceNotFound, e:
            logger.error('JitGraph could not find job %s. Exception: %s' % (sid, e))
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
        outputJSON = []
        outputJSON = self.prepareJSONResults(dataset,fieldNames)
        logger.info(outputJSON)

        cherrypy.response.headers['Content-Type'] = 'text/json'
        return json.dumps(outputJSON, sort_keys=True)
#        return self.render_json(outputJSON)

#   link 2 fields in a result dataset
    def prepareJSONResults(self,resDataset,fieldNames):
        subResDict = {}
        limit = 2 if len(fieldNames) > 2 else 1
        logger.info("Range is"+str(limit))
        #Macht nodes an pos 0+1 und 1+2
        for j in range(0,limit):
            for i, result in enumerate(resDataset):
                logger.info("Starting a row")
                logger.info(result)
                logger.info(result.__dict__)
                src = str(result.get(fieldNames[j]))
                dst = str(result.get(fieldNames[j+1]))
                #Gibts den knoten schon
                if src in subResDict: 
                    logger.info(src+ " was found")
                    logger.info(subResDict[src])
 
                    makeEdge=True
                    for adj in subResDict[src]["adjacencies"]:
                        if adj["nodeTo"] == dst:
                            #Diese verbindung gibts schon
                            logger.info("Kannte erkannt Liniendicke erhohen "+src+" "+adj["nodeTo"]+","+dst)
                            if adj["data"]["$lineWidth"]  < 10:
                                adj["data"]["$lineWidth"] += 0.5
                            adj["data"]["connections"] += 1
                            makeEdge=False
                        else:
                            logger.info("Kannte nicht erkannt src"+src+" "+adj["nodeTo"]+" "+dst)
                    #neue Verbindung
                    if makeEdge:
                        logger.info("Neue kante "+src+" "+dst)
                        adj = self.makeAdjacency(src,dst)
                        subResDict[src]["adjacencies"].append(adj)

                else:    
                    #neuer knoten
                    adj = self.makeAdjacency(src,dst)
                    new_node = self.makeNode(src,src,[adj])
                    logger.info("Neuer knoten src"+src+" dst"+dst)
                    logger.info(new_node)
                    subResDict[src] = new_node
                if dst not  in subResDict: 
                    newDestNode = self.makeNode(dst,dst,[])
                    logger.info("Neuer knoten dst "+dst)
                    logger.info(newDestNode)
                    subResDict[dst] = newDestNode
                else:
                    logger.info(dst +" gibts schon da machen wir nichts")
        logger.info("Results Dict: ")
        logger.info(subResDict)
        return subResDict.values()
    def makeAdjacency(self,nodeFrom,nodeTo):
            adj = {}
            adj["nodeTo"] = nodeTo
            adj["nodeFrom"] = nodeFrom
            adj_data = {}
            adj_data["$lineWidth"]= 0.5
            adj_data["connections"]= 1
            adj["data"]=adj_data
            return adj
    def makeNode(self,id,name,adjacencies=[]):
            logger.info(adjacencies) 
            node = {}
            node["id"]=id
            node["name"]=name
            node["adjacencies"]=adjacencies
            return node
        
        
    def render_json(self, response_data, set_mime='text/json'):
        cherrypy.response.headers['Content-Type'] = set_mime

        if isinstance(response_data, jsonresponse.JsonResponse):
            response = response_data.toJson().replace("</", "<\\/")
        else:
            response = json.dumps(response_data).replace("</", "<\\/")

        # Pad with 256 bytes of whitespace for IE security issue. See SPL-34355
        return ' ' * 256  + '\n' + response
