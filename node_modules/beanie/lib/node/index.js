var beanpoll = require('beanpoll'),
    haba     = require('haba');



exports.loader = function() {

	var loader = haba.loader(),
	router     = beanpoll.router();

	loader.router = router;

	return loader.options(router);
}