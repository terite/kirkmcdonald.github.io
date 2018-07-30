global.window = {}

const bigInt = require("../third_party/BigInteger.min.js");
global.bigInt = bigInt

const {Rational} = require("../rational.js");


for (key in window) {
    global[key] = window[key]
}

const rat = (p, q) => new Rational(bigInt(p), bigInt(q));

function rationalEquality(first, second) {
    if ((first instanceof Rational) && (second instanceof Rational)) {
        return first.equal(second)
    }
};

describe("Rational", function() {

    beforeEach(function() {
        jasmine.addCustomEqualityTester(rationalEquality);
    });

    it("should normalize inputs", function () {
        expect(rat(0, 10)).toEqual(rat(0, 1))

        expect(rat(5, 10)).toEqual(rat(1, 2))

        expect(rat(-5, -10)).toEqual(rat(1, 2))
        expect(rat(-5, 10)).toEqual(rat(-1, 2))
        expect(rat(5, -10)).toEqual(rat(-1, 2))
    })

    it("should support addition", function() {
        //same base
        let sum = rat(1, 1).add(rat(1,1));
        expect(sum).toEqual(rat(2, 1))

        // different base
        sum = rat(1, 1).add(rat(3,2));
        expect(sum).toEqual(rat(5, 2))
    })

    it("should support subtraction", function() {
        //same base
        let sum = rat(1, 1).sub(rat(1,1));
        expect(sum).toEqual(rat(0, 1))

        // different base
        sum = rat(1, 1).sub(rat(3,2));
        expect(sum).toEqual(rat(-1, 2))
    })

    it("should support multiplication", function () {
        // same base
        expect(rat(8, 1).mul(rat(2, 1))).toEqual(rat(16, 1))

        // different base
        expect(rat(1, 1).mul(rat(1, 2))).toEqual(rat(1, 2))
        expect(rat(1, 1).mul(rat(2, 1))).toEqual(rat(2, 1))

        // sign change
        expect(rat(8, 1).mul(rat(-2, 1))).toEqual(rat(-16, 1))
    });

    it("should support division", function () {
        // same base
        expect(rat(8, 1).div(rat(2, 1))).toEqual(rat(4, 1))

        // different base
        expect(rat(1, 1).div(rat(1, 2))).toEqual(rat(2, 1))
        expect(rat(1, 1).div(rat(2, 1))).toEqual(rat(1, 2))

        // sign change
        expect(rat(8, 1).div(rat(-2, 1))).toEqual(rat(-4, 1))
    });

    it("should support divmod", function () {
        expect(rat(4, 1).divmod(rat(2, 1))).toEqual({
            quotient: rat(2, 1),
            remainder: rat(0, 1)
        }) 

        expect(rat(5, 1).divmod(rat(2, 1))).toEqual({
            quotient: rat(2, 1),
            remainder: rat(1, 1)
        }) 

        expect(rat(1, 2).divmod(rat(2, 1))).toEqual({
            quotient: rat(0, 1),
            remainder: rat(1, 2)
        }) 
    });

    it("should support floor", function () {
        expect(rat(0, 2).floor()).toEqual(rat(0, 1))
        expect(rat(1, 2).floor()).toEqual(rat(0, 1))
        expect(rat(2, 2).floor()).toEqual(rat(1, 1))
    });

    it("should support ceil", function () {
        expect(rat(0, 2).ceil()).toEqual(rat(0, 1))
        expect(rat(1, 2).ceil()).toEqual(rat(1, 1))
        expect(rat(2, 2).ceil()).toEqual(rat(1, 1))
    });

    it("should support abs", function () {
        expect(rat(0, 1).abs()).toEqual(rat(0, 1))
        expect(rat(-0, 1).abs()).toEqual(rat(0, 1))
        expect(rat(0, -1).abs()).toEqual(rat(0, 1))

        expect(rat(1, 1).abs()).toEqual(rat(1, 1))
        expect(rat(-1, 1).abs()).toEqual(rat(1, 1))
        expect(rat(1, -1).abs()).toEqual(rat(1, 1))
    });

    it("should support toFloat", function() {
        expect(rat(0, 2).toFloat()).toEqual(0)
        expect(rat(1, 2).toFloat()).toEqual(0.5)
        expect(rat(1, 1).toFloat()).toEqual(1)
        expect(rat(3, 10).toFloat()).toEqual(0.3)
    });

    it("should support toString", function() {
        expect(rat(0, 2).toString()).toEqual("0")
        expect(rat(1, 2).toString()).toEqual("1/2")
        expect(rat(1, 1).toString()).toEqual("1")
        expect(rat(3, 10).toString()).toEqual("3/10")
    })

    it("should support toDecimal", function() {
        expect(rat(0, 2).toDecimal()).toEqual("0")
        expect(rat(1, 2).toDecimal()).toEqual("0.5")
        expect(rat(1, 1).toDecimal()).toEqual("1")
        expect(rat(3, 10).toDecimal()).toEqual("0.3")

        expect(rat(1, 3).toDecimal()).toEqual("0.333")
        expect(rat(2, 3).toDecimal()).toEqual("0.667")

        let factor = rat(0, 1)
        expect(rat(1, 3).toDecimal(0, factor)).toEqual("0")
        expect(rat(1, 3).toDecimal(1, factor)).toEqual("0.3")
        expect(rat(1, 3).toDecimal(2, factor)).toEqual("0.33")

        factor = rat(1, 1)
        expect(rat(1, 3).toDecimal(0, factor)).toEqual("1")
        expect(rat(1, 3).toDecimal(1, factor)).toEqual("1.3")
        expect(rat(1, 3).toDecimal(2, factor)).toEqual("1.33")

        factor = rat(2, 1)
        expect(rat(1, 3).toDecimal(0, factor)).toEqual("2")
        expect(rat(1, 3).toDecimal(1, factor)).toEqual("2.3")
        expect(rat(1, 3).toDecimal(2, factor)).toEqual("2.33")

        factor = rat(1, 2)
        expect(rat(1, 3).toDecimal(0, factor)).toEqual("0")
        expect(rat(1, 3).toDecimal(1, factor)).toEqual("0.8")
        expect(rat(1, 3).toDecimal(2, factor)).toEqual("0.83")
    })

    it("should support toUpDecimal", function() {
        expect(rat(0, 2).toUpDecimal(3)).toEqual("0")
        expect(rat(1, 2).toUpDecimal(3)).toEqual("0.5")
        expect(rat(1, 1).toUpDecimal(3)).toEqual("1")
        expect(rat(3, 10).toUpDecimal(3)).toEqual("0.3")

        expect(rat(1, 3).toUpDecimal(3)).toEqual("0.334")
        expect(rat(1, 3).toUpDecimal(2)).toEqual("0.34")
        expect(rat(1, 3).toUpDecimal(1)).toEqual("0.4")
        expect(rat(1, 3).toUpDecimal(0)).toEqual("1")

        expect(rat(2, 3).toUpDecimal(3)).toEqual("0.667")
    })
})
