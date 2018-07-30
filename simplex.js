"use strict"

function pivot(A, row, col) {
    var x = A.index(row, col)
    A.mulRow(row, x.invert())
    for (var r = 0; r < A.rows; r++) {
        if (r === row) {
            continue
        }
        var ratio = A.index(r, col)
        if (ratio.isZero()) {
            continue
        }

        for (var c = 0; c < A.cols; c++) {
            var other = A.index(row, c)
            if (other.isZero()) {
                continue
            }
            x = A.index(r, c).sub(other.mul(ratio))
            A.setIndex(r, c, x)
        }
    }
}

function pivotCol(A, col) {
    var best_ratio = null
    var best_row = null
    for (var row = 0; row < A.rows - 1; row++) {
        var x = A.index(row, col)
        if (!zero.less(x)) {
            continue
        }
        var ratio = A.index(row, A.cols - 1).div(x)
        if (best_ratio === null || ratio.less(best_ratio)) {
            best_ratio = ratio
            best_row = row
        }
    }
    if (best_ratio !== null) {
        pivot(A, best_row, col)
    }
    return best_row
}

function simplex(A) {
    console.log("Simplexing a", A.cols, "x", A.rows, "matrix")
    while (true) {
        var min = null
        var minCol = null
        for (var col = 0; col < A.cols - 1; col++) {
            var x = A.index(A.rows - 1, col)
            if (min === null || x.less(min)) {
                min = x
                minCol = col
            }
        }
        if (!min.less(zero)) {
            return
        }
        pivotCol(A, minCol)
    }
}
