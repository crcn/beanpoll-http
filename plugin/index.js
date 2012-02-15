
// for npm link
require('haba').paths(__dirname + '/beans');

exports.plugin = function(router)
{
	this.require(__dirname + '/plugins');
}