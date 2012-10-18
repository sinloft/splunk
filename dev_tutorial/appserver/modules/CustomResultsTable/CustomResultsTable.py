#
# Splunk UI module python renderer
# This module is imported by the module loader (lib.module.ModuleMapper) into
# the splunk.appserver.mrsparkle.controllers.module.* namespace.
#

import controllers.module as module

import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n

import logging
logger = logging.getLogger('splunk.module.CustomResultsTable')

import math
import cgi

class CustomResultsTable(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, count=1000, 
            offset=0, entity_name='results'):

        count = max(int(count), 0)
        offset = max(int(offset), 0)
        if not sid:
            raise Exception('CustomResultsTable.generateResults - sid not passed!')

        try:
            job = splunk.search.getJob(sid)
        except splunk.ResourceNotFound, e:
            logger.error('CustomResultsTable could not find job %s.' % sid)
            return _('<p class="resultStatusMessage">Could not retrieve search data.</p>')
        
        output = []
        output.append('<div class="CustomResultsTableWrapper">')
        output.append('<table class="CustomResultsTable splTable">')
  
        fieldNames = [x for x in getattr(job, entity_name).fieldOrder if (not x.startswith('_'))]
        
        dataset = getattr(job, entity_name)[offset: offset+count]
        
        for i, result in enumerate(dataset):
            output.append('<tr>')
            for field in fieldNames:
                output.append('<td')
                fieldValues = result.get(field, None)
                if fieldValues:
                    output.append('>%s</td>' % fieldValues)
                else:
                    output.append('></td>')
            output.append('</tr>')
        output.append('</table></div>')

        output = ''.join(output)

        return output
