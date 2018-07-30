"use strict"

function Rational(p, q) {
    if (q.lesser(bigInt.zero)) {
        p = bigInt.zero.minus(p)
        q = bigInt.zero.minus(q)
    }

    if (p.isZero()) {
        q = bigInt.one
    } else {
        var gcd = bigInt.gcd(p.abs(), q)
        if (gcd.greater(bigInt.one)) {
            p = p.divide(gcd)
            q = q.divide(gcd)
        }
    }

    this.p = p
    this.q = q
}
Rational.prototype = {
    constructor: Rational,
    toFloat: function() {
        return this.p.toJSNumber() / this.q.toJSNumber()
    },
    toString: function() {
        if (this.q.equals(bigInt.one)) {
            return this.p.toString()
        }
        return this.p.toString() + "/" + this.q.toString()
    },
    toDecimal: function(maxDigits, roundingFactor) {
        if (maxDigits == null) {
            maxDigits = 3
        }
        if (roundingFactor == null) {
            roundingFactor = new Rational(bigInt(5), bigInt(10).pow(maxDigits+1))
        }

        var sign = ""
        var x = this
        if (x.less(zero)) {
            sign = "-"
            x = zero.sub(x)
        }
        x = x.add(roundingFactor)
        var divmod = x.p.divmod(x.q)
        var integerPart = divmod.quotient.toString()
        var decimalPart = ""
        var fraction = new Rational(divmod.remainder, x.q)
        var ten = new Rational(bigInt(10), bigInt.one)
        while (maxDigits > 0 && !fraction.equal(roundingFactor)) {
            fraction = fraction.mul(ten)
            roundingFactor = roundingFactor.mul(ten)
            divmod = fraction.p.divmod(fraction.q)
            decimalPart += divmod.quotient.toString()
            fraction = new Rational(divmod.remainder, fraction.q)
            maxDigits--
        }
        if (fraction.equal(roundingFactor)) {
            while (decimalPart[decimalPart.length - 1] == "0") {
                decimalPart = decimalPart.slice(0, decimalPart.length - 1)
            }
        }
        if (decimalPart != "") {
            return sign + integerPart + "." + decimalPart
        }
        return sign + integerPart
    },
    toUpDecimal: function(maxDigits) {
        var fraction = new Rational(bigInt.one, bigInt(10).pow(maxDigits))
        var divmod = this.divmod(fraction)
        var x = this
        if (!divmod.remainder.isZero()) {
            x = x.add(fraction)
        }
        return x.toDecimal(maxDigits, zero)
    },
    toMixed: function() {
        var divmod = this.p.divmod(this.q)
        if (divmod.quotient.isZero() || divmod.remainder.isZero()) {
            return this.toString()
        }
        return divmod.quotient.toString() + " + " + divmod.remainder.toString() + "/" + this.q.toString()
    },
    isZero: function() {
        return this.p.isZero()
    },
    isInteger: function() {
        return this.q.equals(bigInt.one)
    },
    ceil: function() {
        var divmod = this.p.divmod(this.q)
        var result = new Rational(divmod.quotient, bigInt.one)
        if (!divmod.remainder.isZero()) {
            result = result.add(one)
        }
        return result
    },
    floor: function() {
        var divmod = this.p.divmod(this.q)
        var result = new Rational(divmod.quotient, bigInt.one)
        if (result.less(zero) && !divmod.remainder.isZero()) {
            result = result.sub(one)
        }
        return result
    },
    equal: function(other) {
        return this.p.equals(other.p) && this.q.equals(other.q)
    },
    less: function(other) {
        return this.p.times(other.q).lesser(this.q.times(other.p))
    },
    abs: function() {
        if (this.p.isNegative()) {
            return new Rational(
                this.p.abs(),
                this.q
            )
        }
        return this
    },
    add: function(other) {
        return new Rational(
            this.p.times(other.q).plus(this.q.times(other.p)),
            this.q.times(other.q)
        )
    },
    sub: function(other) {
        return new Rational(
            this.p.times(other.q).subtract(this.q.times(other.p)),
            this.q.times(other.q)
        )
    },
    mul: function(other) {
        return new Rational(
            this.p.times(other.p),
            this.q.times(other.q)
        )
    },
    div: function(other) {
        return new Rational(
            this.p.times(other.q),
            this.q.times(other.p)
        )
    },
    invert: function() {
        return new Rational(
            this.q,
            this.p
        )
    },
    divmod: function(other) {
        var quotient = this.div(other)
        var div = quotient.floor()
        var mod = this.sub(other.mul(div))
        return {quotient: div, remainder: mod}
    },
}

Rational.fromString = function fromString(s) {
    var i = s.indexOf("/")
    if (i === -1) {
        return Rational.fromFloat(Number(s))
    }
    var j = s.indexOf("+")
    var q = bigInt(s.slice(i + 1))
    if (j !== -1) {
        var integer = bigInt(s.slice(0, j))
        var p = bigInt(s.slice(j + 1, i)).plus(integer.times(q))
    } else {
        var p = bigInt(s.slice(0, i))
    }
    return new Rational(p, q)
}

// Decimal approximations.
var _one_third = new Rational(bigInt(3333), bigInt(10000))
var _two_thirds = new Rational(bigInt(3333), bigInt(5000))

Rational.fromFloat = function fromFloat(x) {
    if (Number.isInteger(x)) {
        return Rational.fromFloats(x, 1)
    }
    // Sufficient precision for our data?
    var r = new Rational(bigInt(Math.round(x * 10000)), bigInt(10000))
    // Recognize 1/3 and 2/3 explicitly.
    var divmod = r.divmod(one)
    if (divmod.remainder.equal(_one_third)) {
        return divmod.quotient.add(oneThird)
    } else if (divmod.remainder.equal(_two_thirds)) {
        return divmod.quotient.add(twoThirds)
    }
    return r
}

Rational.fromFloats = function fromFloats(p, q) {
    return new Rational(bigInt(p), bigInt(q))
}

var minusOne = new Rational(bigInt.minusOne, bigInt.one)
var zero = new Rational(bigInt.zero, bigInt.one)
var one = new Rational(bigInt.one, bigInt.one)
var half = new Rational(bigInt.one, bigInt(2))
var oneThird = new Rational(bigInt.one, bigInt(3))
var twoThirds = new Rational(bigInt(2), bigInt(3))

if (typeof(module) !== 'undefined') {
    module.exports.Rational = Rational;
}
