"use strict"

import http from "http"
import _ from "lodash"

export class CommonProtocolDriver {
	constructor({port}) {
		this.server = http.createServer(this._handler.bind(this))
		this.port = port
		this.reset()
	}
	start() {
		this.server.listen(this.port, "127.0.0.1")
	}
	stop() {
		this.server.close()
	}
	reset() {
		this.rules = [];
	}
	addRule({request, response, delay, useRawResponse}) {
		delay = delay || 0
        this.rules = this.rules || [];
		this.rules.push({request, response, delay, useRawResponse})
	}
	_handler(req, res) {
		let This = this
		let body = ""
		req.on('data', function (data) {
            body += data
        })
        req.on('end', function () {
			let request = JSON.parse(body)
			let rule = _.find(This.rules, function(rule) {
				return _.isEqual(rule.request, request)
			})
			
			if (rule) {
				_.delay(function() {
					res.writeHead(200, {'Content-Type': rule.useRawResponse ? 'text/html' : 'application/json'})
					res.end(rule.useRawResponse ? rule.response : JSON.stringify(rule.response))
				}, rule.delay)
			} else {
				res.writeHead(404)
				res.end()
			}
        })	
	}
}
