switch (Splunk.util.getCurrentView()) {
   case "Example3":
      if (Splunk.Module.NullModule) {
         Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
            getModifiedContext: function() {
               var context = this.getContext(), 
                     click = context.getAll('click');

               alert (click.value);
               return context;
            }
         });
      }
   break;
}
