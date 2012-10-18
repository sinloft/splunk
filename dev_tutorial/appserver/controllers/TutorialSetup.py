import logging
import os
import sys
import cherrypy

import splunk
import splunk.bundle as bundle
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
from splunk.appserver.mrsparkle.lib.decorators import expose_page

#dir = os.path.join(util.get_apps_dir(), __file__.split('.')[-2], 'bin')
#if not dir in sys.path:
#    sys.path.append(dir)
    
from splunk.models.event_type import EventType
#from splunk.models.app import App 
#from app import App 

logger = logging.getLogger('splunk.appserver.mrsparkle.controllers.TutorialSetup')

class TutorialSetup(controllers.BaseController):
    '''App Framework Tutorial Setup Controller'''

    @expose_page(must_login=True, methods=['GET']) 
    def show(self, **kwargs):
        
        return self.render_template('/dev_tutorial:/templates/setup.html')

    @expose_page(must_login=True, trim_spaces=True, methods=['POST']) 
    def save(self, **params):

        form_content = {}
        user = cherrypy.session['user']['name'] 
        host_app = cherrypy.request.path_info.split('/')[3]

        for key, val in params.iteritems():
            try:
                form_content[key] = EventType.get(EventType.build_id(key, 'dev_tutorial', user))
                form_content[key] = val
            except Exception, ex:
                logger.info(ex)
                form_content[key] = EventType('dev_tutorial', user, key)
#            form_content[key].search = 'Yes'
            
        for key in form_content.keys():
            try:
                form_content[key].passive_save()
            except splunk.AuthorizationFailed:
                logger.info('User %s is unauthorized to perform setup on %s' % (user, 'dev_tutorial'))
            except Exception, ex:
                logger.info(ex)
                logger.info('Failed to save eventtype %s' % key)
      
        return self.render_template('/dev_tutorial:/templates/success.html') 
