

### Features

- expose your beanpole routes over HTTP
- easy to specify HTTP Middleware


### Beans

- `http.gateway` exposes your beanpole routes over HTTP.
- `http.server` starts up the http server.
- `http.middleware` middleware for http specific routes



### Usage

First off, use this block of code wherever you want to include the http beans:

```javascript

//sets add a require path to the app
require('beans.http');

var router = require('beanpole').router();


//load all the beans
router.require('beans.http');


//or load them individually
router.require('http.gateway','http.server','http.middleware');


```


### Middleware


#### Basic Auth Middleware


```javascript


router.on({
	
	/**
	 */
	
	'pull basic/auth/user/pass -> secret/route': function()
	{
		return "authorized!";
	},
	
	
	/**
	 */
	
	'pull secret/route': function(request)
	{
		function login(user, pass, callback)
		{
			if(user == 'user' && pass == 'pass') return callback(false, { user: 'user' });
			
			callback('wrong user / pass');
		}
		
		request.forward('basic/auth', { login: login }, function(response)
		{
			request.end('authorized!');
		})
	}
});

```

#### Session Middleware

```javascript

router.on({
	
	/**
	 */
	
	'pull session -> account': function(request)
	{
		
		//should be "test" on next call
		console.log(request.session.data.username);
		
		request.session.data.username = 'test';
	},
	
})

```





