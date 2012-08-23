var MemSessionManager = require('./session/session').MemSessionManager,
	vine = require('vine'),
	basic = require('./auth/basic'),
	qs = require('querystring'),
	Structr = require('structr');


exports.plugin = function(router)
{

	var session = new MemSessionManager();
	
	var bodyParser = {
	    'application/x-www-form-urlencoded': qs.parse
	  , 'application/json': JSON.parse
	};

	router.on({
		
		/**
		 */

		'pull -private session': function()
		{
			if(this.session)
			{
				this.next();
				return;
			}

			var sessid = this.data.sessid,

			//key is an additional safe guard against session injections.
			key = 'undefined',
			req = this.req,
			self = this;

			//http?
			if(req)
			{
				key = req.headers['user-agent'];
				var sessidParts = (req.headers['cookie'] || '').match(/sessid=([^;]+)/);
				if(sessidParts) sessid = sessidParts[1];
			}


			session.getSession( { id: sessid, key: key }, function(session)
			{
				self.session = session;
				
				self.respond({ session: session });

				if(!self.next()) vine.message('session set').end(self);
			});
		},


		/**
		 * basic authentication passthru
		 */

		'pull -private basic/auth/:user/:pass OR basic/auth': function(req, res)
		{
			if(!this.req) return vine.error('basic auth is specific to http for now').end(req, res);

			var self = this;


			basic.test({
				request: self.req,
				login: this.login || function(user, pass, callback)
				{
					if(self.data.user == user && self.data.pass == pass)
					{
						callback(false, { name: user, pass: pass });
					}
					else
					{
						callback(true);
					}
				},
				callback: function(err, user)
				{
					if(err)
					{
						if(self.data.basicAuth == undefined || self.data.basicAuth) self.respond({ authorization: { http: err } });

						return self.end(vine.error('Unauthorized.').end());
					}

					self.profile = self.account = user;


					if(!self.next()) vine.message('Authorized').result(user).end(self)
				}
			});
		},

		/**
		 * parses post body
		 */

		'pull -private parse/body': function(req, res, mw)
		{
			var body = '';
			parser = bodyParser[req.headers['content-type']] || bodyParser['application/x-www-form-urlencoded'];
			
			req.on('data', function(chunk, encoding)
			{
				body += chunk;
			});
			                          
			req.on('end', function(chunk)
			{
				try
				{                          
					Structr.copy(req.body = body && parser ? parser(body) : body || {}, req.data);                      
				}
				catch(e)
				{                    
					req.body = null;
				}
				
				mw.next();
			});
		}
	})
}