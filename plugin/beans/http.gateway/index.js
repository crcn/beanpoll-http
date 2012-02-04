var logger = require('winston').loggers.get('bean.http'),
sprintf    = require('sprintf').sprintf,
mime       = require('mime'),
_          = require('underscore'),
beanpollMiddleware = require('./middleware/beanpoll'),
connect    = require('connect'),
tq = require('tq')

require('./monkeypatch/response');


exports.plugin = function(router, params) {



	var use = [], server;


	
    router.on({

    	/**
    	 */

        'push init': function()
        {
        	//params present? start the http port
			if(params)
			{
				if(params.http)
				{
					router.request('http/start', { port: params.http.port }).pull();
				}
			}


			router.on({
				
		        /**
		         * middleware for the requests
		         */

		        'push -collect http/request/middleware': function(middleware)
		        {

		        	// mw.add(middleware);
		        	use.push(middleware);
		        }
			});
	    },    
        

        /**
         */
         
        'push http/server': function(srv)
        {
        	server = srv;

        	logger.info('http.gateway received server');

            if(params.dir) 
            	server.use(connect.static(params.dir));

            server.use(function(req, res, next) {
            	
            	var q = tq.queue();

            	use.forEach(function(mw) {
            		
            		q.push(function() {

            			mw(req, res, this);

            		});
            	});

            	q.push(next);

            	q.start();
            });
            	
            server.use(beanpollMiddleware(router));
        }
    });
}