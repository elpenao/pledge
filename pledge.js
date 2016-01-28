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
			self.callHandler(group, self, 'success');
		});
		self.$promise.handlerGroups = [];
	}	
}

Deferral.prototype.callHandler = function(group, self, status) {
	var handler = '';
	var resOrRej = '';
	if (status === 'success') {
		handler = 'successCb';
		resOrRej = 'resolve';
	} else {
		handler = 'errorCb';
		resOrRej = 'reject';
	}
	if (group[handler]) {  
		try {
			var returned = group[handler](self.$promise.value);
			if (returned) {
				if (returned instanceof $Promise) {
					self.mimicPromise(group.forwarder, returned);
				} else {
					group.forwarder.resolve(returned);
				}
			}
		} catch (e) {
			group.forwarder.reject(e)
		}
	}
	else {
		group.forwarder[resOrRej](self.$promise.value);
	}
}

Deferral.prototype.mimicPromise = function(oldDeferral, newPromise) {
	newPromise.then(function(d) {
		oldDeferral.resolve(d);
	});
}


Deferral.prototype.reject = function (data){
	if (this.$promise.state === 'pending'){
		this.$promise.value = data;
		this.$promise.state = 'rejected';
		var self = this;
		self.$promise.handlerGroups.forEach(function(group){
			self.callHandler(group, self, 'failure');
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
