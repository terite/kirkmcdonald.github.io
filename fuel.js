"use strict"

var energySuffixes = ["J", "kJ", "MJ", "GJ", "TJ", "PJ"]

function Fuel(name, col, row, item, category, value) {
    this.name = name
    this.icon_col = col
    this.icon_row = row
    this.item = item
    this.category = category
    this.value = value
}
Fuel.prototype = {
    constructor: Fuel,
    valueString: function() {
        var x = this.value
        var thousand = Rational.fromFloat(1000)
        var i = 0
        while (thousand.less(x) && i < energySuffixes.length - 1) {
            x = x.div(thousand)
            i++
        }
        return x.toUpDecimal(0) + " " + energySuffixes[i]
    }
}

function getFuel(data, items) {
    var fuelCategories = {}
    for (var i = 0; i < data.fuel.length; i++) {
        var fuelName = data.fuel[i]
        // XXX: Due to certain bugs, don't permit certain fuels.
        if (fuelName === "small-electric-pole") {
            continue
        }
        var d = data.items[fuelName]
        var fuel = new Fuel(
            fuelName,
            d.icon_col,
            d.icon_row,
            getItem(data, items, fuelName),
            d.fuel_category,
            Rational.fromFloat(d.fuel_value)
        )
        var f = fuelCategories[fuel.category]
        if (!f) {
            f = []
            fuelCategories[fuel.category] = f
        }
        f.push(fuel)
    }
    for (var category in fuelCategories) {
        fuelCategories[category].sort(function(a, b) {
            if (a.value.less(b.value)) {
                return -1
            } else if (b.value.less(a.value)) {
                return 1
            }
            return 0
        })
    }
    return fuelCategories
}
