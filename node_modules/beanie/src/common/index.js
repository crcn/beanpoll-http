var beanpoll = require('beanpoll'),
    plugin     = require('plugin');



exports.loader = function() {

	var loader = plugin.loader(),
	router     = beanpoll.router();

	loader.router = router;

	return loader.options(router);
}