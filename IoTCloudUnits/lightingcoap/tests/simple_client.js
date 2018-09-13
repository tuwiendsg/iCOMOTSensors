//Emulating a single light which is a coap server listen for command.

const coap = require('coap');
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.1.0',
  addHelp:true,
  description: 'simple coap sender'
});
parser.addArgument(
  [ '-a', '--address' ],
  {
    help: 'address of coap group'
  }
);

var args = parser.parseArgs();

var client = coap.request({
	host: args.address, multicast: true, multicastTimeout: 3000
}).end()
