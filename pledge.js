'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise (data) {
	// body...
	this.value = data;
	this.state = 'pending';
	this.handlerGroups = [];
}

$Promise.prototype.then = function(successCb,errorCb) {
	// body...
	var handlerGroup = {
		successCb: null,
		errorCb: null,
		forwarder: defer()
	}
	if(typeof successCb === 'function') handlerGroup.successCb = successCb
	if(typeof errorCb === 'function') handlerGroup.errorCb = errorCb
	if(this.state === 'resolved') {
		if (handlerGroup.successCb) handlerGroup.successCb(this.value)
	} 	else if(this.state === 'rejected') {
		if (handlerGroup.errorCb) handlerGroup.errorCb(this.value)
	} else this.handlerGroups.push(handlerGroup);
	if (this.state === 'resolved' && !handlerGroup.successCb) {
		handlerGroup.forwarder.resolve(this.value);
	}
	return handlerGroup.forwarder.$promise;
};

$Promise.prototype.catch = function(errorCb) {
	return this.then(null, errorCb);
};

function Deferral () {
	// body...
	this.$promise = new $Promise;
} 

Deferral.prototype.resolve = function (data){
	if (this.$promise.state === 'pending'){
		this.$promise.value = data;
		this.$promise.state = 'resolved';
		var self = this;
		self.$promise.handlerGroups.forEach(function(group){
			if (group.successCb) {
				group.successCb(self.$promise.value);
				// if (group.successCb(self.$promise.value)) {
				// group.forwarder.resolve(group.successCb(self.$promise.value));
				// }
			}
			else {
				group.forwarder.resolve(self.$promise.value);
			}
		});
		self.$promise.handlerGroups = [];
	}
	
}

Deferral.prototype.reject = function (data){
	if (this.$promise.state === 'pending'){
		this.$promise.value = data;
		this.$promise.state = 'rejected';
		var self = this;
		self.$promise.handlerGroups.forEach(function(group){
			if (group.errorCb) group.errorCb(self.$promise.value);
			else {
				group.forwarder.reject(self.$promise.value);
			}
		});
		self.$promise.handlerGroups = [];
	}
	
}

function defer () {
	// body...
	return new Deferral;
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
