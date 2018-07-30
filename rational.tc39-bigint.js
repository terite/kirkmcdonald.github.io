"use strict"

// https://github.com/tc39/proposal-bigint

if (window.BigInt) {
    var biZero = BigInt(0)
    var biOne = BigInt(1)

    console.log("Using chrome BigInt");
    function calc_gcd(a, b) {
        a = BigInt.abs(a)
        b = BigInt.abs(b)
        if (b) {
            return calc_gcd(b, a % b);
        }
        return a;
    }

    BigInt.abs = (n) => {
        if (n < biZero) {
            n = biZero - n
        }
        return n
    }


    BigInt.ceil = (p, q) => {
        var divmod = BigInt.divmod(p, q)
        var result = divmod.quotient
        if (divmod.remainder > biZero) {
            result = result + biOne
        }
        return result
    }

    BigInt.floor = (p, q) => p / q

    BigInt.divmod = (p, q) => ({
        quotient: p / q,
        remainder: p % q
    })

    function Rational(p, q, gcd) {
        if (q < 0) {
            p = 0 - p
            q = 0 - q
        }

        p = BigInt(p)
        q = BigInt(q)

        gcd = gcd || calc_gcd(p, q)
        if (gcd > 1) {
            p = p / gcd
            q = q / gcd
        }
        this.p = p
        this.q = q
    }
    Rational.prototype = {
        constructor: Rational,
        toFloat: function() {
            return this.p / this.q
        },
        toString: function() {
            if (this.q == 1) {
                return this.p.toString()
            }
            return this.p.toString() + "/" + this.q.toString()
        },
        toDecimal: function(maxDigits, roundingFactor) {
            if (maxDigits == null) {
                maxDigits = 3
            }
            if (roundingFactor == null) {
                roundingFactor = new Rational(5, Math.pow(10, maxDigits + 1))
            }

            var sign = ""
            var x = this
            if (x.less(zero)) {
                sign = "-"
                x = zero.sub(x)
            }
            x = x.add(roundingFactor)
            var divmod = BigInt.divmod(x.p, x.q)
            var integerPart = divmod.quotient.toString()
            var decimalPart = ""
            var fraction = new Rational(divmod.remainder, x.q)
            var ten = new Rational(10, 1)
            while (maxDigits > 0 && !fraction.equal(roundingFactor)) {
                fraction = fraction.mul(ten)
                roundingFactor = roundingFactor.mul(ten)
                divmod = BigInt.divmod(fraction.p, fraction.q)
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
            var fraction = new Rational(1, Math.pow(10, maxDigits))

            var divmod = this.divmod(fraction)
            var x = this
            if (!divmod.remainder.isZero()) {
                x = x.add(fraction)
            }
            return x.toDecimal(maxDigits, zero)
        },
        toMixed: function() {
            var divmod = BigInt.divmod(this.p, this.q)
            if (!divmod.quotient || !divmod.remainder) {
                return this.toString()
            }
            return divmod.quotient.toString() + " + " + divmod.remainder.toString() + "/" + this.q.toString()
        },
        isZero: function() {
            return this.p == 0
        },
        isInteger: function() {
            return this.q == 1
        },
        ceil: function() {
            return new Rational(
                BigInt.ceil(this.p, this.q),
                biOne
            )
        },
        floor: function() {
            return new Rational(
                this.p / this.q,
                biOne
            )
        },
        equal: function(other) {
            return (this.p == other.p) && (this.q == other.q)
        },
        less: function(other) {
            return (this.p * other.q) < (this.q * other.p)
        },
        abs: function() {
            if (this.less(zero)) {
                return this.mul(minusOne)
            }
            return this
        },
        add: function(other) {
            return new Rational(
                (this.p * other.q) + (this.q * other.p),
                (this.q * other.q)
            )
        },
        sub: function(other) {
            return new Rational(
                (this.p * other.q) - (this.q * other.p),
                this.q * other.q
            )
        },
        mul: function(other) {
            return new Rational(
                this.p * other.p,
                this.q * other.q,
                calc_gcd(this.p, other.q) * calc_gcd(this.q, other.p)
            )
        },
        div: function(other) {
            return new Rational(
                this.p * other.q,
                this.q * other.p,
                calc_gcd(this.p, other.p) * (calc_gcd(this.q, other.q))
            )
        },
        divmod: function(other) {
            var quotient = this.div(other)
            var div = quotient.floor()
            var mod = this.sub(other.mul(div))
            return {quotient: div, remainder: mod}
        },
    }

    function RationalFromString(s) {

        var i = s.indexOf("/")
        if (i === -1) {
            return RationalFromFloat(Number(s))
        }
        var j = s.indexOf("+")
        var q = BigInt(s.slice(i + 1))
        if (j !== -1) {
            var integer = BigInt(s.slice(0, j))
            var p = BigInt(s.slice(j + 1, i)).plus(integer.times(q))
        } else {
            var p = BigInt(s.slice(0, i))
        }
        return new Rational(p, q)
    }

    // Decimal approximations.
    var _one_third = new Rational(3333, 10000)
    var _two_thirds = new Rational(3333, 5000)

    function RationalFromFloat(x) {
        if (Number.isInteger(x)) {
            return RationalFromFloats(x, 1)
        }
        // Sufficient precision for our data?
        var r = new Rational(Math.round(x * 10000), 10000)
        // Recognize 1/3 and 2/3 explicitly.
        var divmod = r.divmod(one)
        if (divmod.remainder.equal(_one_third)) {
            return divmod.quotient.add(oneThird)
        } else if (divmod.remainder.equal(_two_thirds)) {
            return divmod.quotient.add(twoThirds)
        }
        return r
    }

    function RationalFromFloats(p, q) {
        return new Rational(p, q)
    }

    window.Rational = Rational;
    window.RationalFromFloat = RationalFromFloat
    window.RationalFromFloats = RationalFromFloats
    window.RationalFromString = RationalFromString

    window.minusOne = new Rational(-1, 1)
    window.zero = new Rational(0, 1)
    window.one = new Rational(1, 1)
    window.half = new Rational(1, 2)
    window.oneThird = new Rational(1, 3)
    window.twoThirds = new Rational(2, 3)
}
