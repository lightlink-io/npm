'use strict';

const expect = require('chai').expect;
const lightlink = require('../index');

describe('#firstTest', function() {
    it('should convert single digits', function() {
        var result = lightlink("http://url/",{a:0});
        // expect(result).to.equal('http://url/{"a":0}');
        // todo
    });

});