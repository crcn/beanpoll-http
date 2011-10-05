require.paths.unshift(__dirname + '/beans');

exports.plugin = function(router)
{
	router.require(__dirname + '/beans');
}