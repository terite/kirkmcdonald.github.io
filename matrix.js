"use strict"

// An MxN matrix of rationals.
function Matrix(rows, cols, mat) {
    this.rows = rows
    this.cols = cols
    if (mat) {
        this.mat = mat
    } else {
        var size = rows * cols
        var mat = this.mat = new Array(size)
        for (var i = 0; i < size; i++) {
            mat[i] = zero
        }
    }
}
Matrix.prototype = {
    constructor: Matrix,
    toString: function() {
        var widths = []
        for (var i = 0; i < this.cols; i++) {
            var width = 0
            for (var j = 0; j < this.rows; j++) {
                var s = this.index(j, i).toDecimal(3)
                if (s.length > width) {
                    width = s.length
                }
            }
            widths.push(width)
        }
        var lines = []
        for (var i = 0; i < this.rows; i++) {
            var line = []
            for (var j = 0; j < this.cols; j++) {
                s = this.index(i, j).toDecimal(3).padStart(widths[j])
                line.push(s)
            }
            lines.push(line.join(" "))
        }
        return lines.join("\n")
    },
    copy: function() {
        var mat = this.mat.slice()
        return new Matrix(this.rows, this.cols, mat)
    },
    index: function(row, col) {
        return this.mat[row*this.cols + col]
    },
    setIndex: function(row, col, value) {
        this.mat[row*this.cols + col] = value
    },
    addIndex: function(row, col, value) {
        this.setIndex(row, col, this.index(row, col).add(value))
    },
    mulRow: function(row, value) {
        for (var i = 0; i < this.cols; i++) {
            var x = this.index(row, i)
            this.setIndex(row, i, x.mul(value))
        }
    },
    // Sets a column to all zeros.
    zeroColumn: function(col) {
        for (var i = 0; i < this.rows; i++) {
            this.setIndex(i, col, zero)
        }
    },
    // Sets a row to all zeros.
    zeroRow: function(row) {
        for (var i = 0; i < this.cols; i++) {
            this.setIndex(row, i, zero)
        }
    },
}
