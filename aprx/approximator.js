/**
 * Модуль для точной монотонно убывающей аппроксимации полиномом.
 * Использует комбинацию метода наименьших квадратов (OLS) и градиентного спуска со штрафом.
 */
export class MonotonicApproximator {
    /**
     * Возвращает функцию полинома для вычисления значений по схеме Горнера.
     * Эквивалент вашей функции: K => v => K.reduce((a, k) => a * v + k)
     */
    static getPolyEvaluator() {
        return K => v => K.reduce((a, k) => a * v + k);
    }

    /**
     * Вычисляет производную полинома в точке x (используется для контроля монотонности)
     */
    static #polyDerivative(K, x, degree) {
        const dK = [];
        for (let i = 0; i < K.length - 1; i++) {
            dK.push(K[i] * (degree - i));
        }
        return dK.reduce((a, k) => a * x + k, 0);
    }

    /**
     * Шаг 1: Классический метод наименьших квадратов через Гаусса
     */
    static #fitPolynomialOLS(xVals, yVals, degree) {
        const n = xVals.length;
        const m = degree + 1;
        const XT_X = Array.from({ length: m }, () => new Array(m).fill(0));
        const XT_Y = new Array(m).fill(0);

        for (let i = 0; i < n; i++) {
            const x = xVals[i];
            const y = yVals[i];
            const powers = [];
            for (let p = 0; p <= 2 * degree; p++) {
                powers[p] = Math.pow(x, p);
            }

            for (let row = 0; row < m; row++) {
                const pRow = degree - row;
                for (let col = 0; col < m; col++) {
                    const pCol = degree - col;
                    XT_X[row][col] += powers[pRow + pCol];
                }
                XT_Y[row] += y * powers[pRow];
            }
        }
        return this.#gaussianElimination(XT_X, XT_Y);
    }

    /**
     * Решение СЛАУ методом Гаусса с выбором главного элемента
     */
    static #gaussianElimination(A, B) {
        const n = B.length;
        for (let i = 0; i < n; i++) {
            let maxEl = Math.abs(A[i][i]);
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(A[k][i]) > maxEl) {
                    maxEl = Math.abs(A[k][i]);
                    maxRow = k;
                }
            }
            const tmp = A[maxRow]; A[maxRow] = A[i]; A[i] = tmp;
            const t = B[maxRow]; B[maxRow] = B[i]; B[i] = t;

            for (let k = i + 1; k < n; k++) {
                const c = -A[k][i] / A[i][i];
                for (let j = i; j < n; j++) {
                    A[k][j] = (i === j) ? 0 : A[k][j] + c * A[i][j];
                }
                B[k] += c * B[i];
            }
        }
        const K = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            K[i] = B[i] / A[i][i];
            for (let k = i - 1; k >= 0; k--) {
                B[k] -= A[k][i] * K[i];
            }
        }
        return K;
    }

    /**
     * Шаг 2: Локальная полировка для принудительного удаления изгибов вверх
     */
    static #refineMonotonicity(baseK, xVals, yVals, startX, endX, degree) {
        const K = [...baseK];
        const lr = 0.01;
        const epochs = 10000;
        const penaltyWeight = 500000;
        const polyEval = this.getPolyEvaluator();

        const lossFunction = (currentK) => {
            let error = 0;
            const f = polyEval(currentK);
            
            // Ошибка попадания в точки
            for (let i = 0; i < xVals.length; i++) {
                error += Math.pow(f(xVals[i]) - yVals[i], 2);
            }
            
            // Штраф за нарушение монотонности (f'(x) > 0)
            for (let x = startX; x <= endX; x += 0.01) {
                const deriv = this.#polyDerivative(currentK, x, degree);
                if (deriv > 0) {
                    error += penaltyWeight * Math.pow(deriv, 2);
                }
            }
            return error;
        };

        const h = 0.000001;
        for (let step = 0; step < epochs; step++) {
            const grad = new Array(K.length).fill(0);
            for (let i = 0; i < K.length; i++) {
                K[i] += h; const lHigh = lossFunction(K);
                K[i] -= 2 * h; const lLow = lossFunction(K);
                K[i] += h;
                grad[i] = (lHigh - lLow) / (2 * h);
            }

            for (let i = 0; i < K.length; i++) {
                K[i] -= lr * grad[i];
            }
        }
        return K;
    }

    /**
     * Основной публичный метод для расчёта монотонных коэффициентов
     * @param {number[]} probe - Массив значений Y
     * @param {number} startX - Начало диапазона X (например, 0.2)
     * @param {number} endX - Конец диапазона X (например, 0.5)
     * @param {number} coefficientCount - Желаемое число коэффициентов K (например, 5)
     * @returns {number[]} Массив коэффициентов K, упорядоченный от высшей степени к низшей
     */
    static calculateK(probe, startX, endX, coefficientCount = 5) {
        const degree = coefficientCount - 1;
        
        // Автоматическая генерация равномерной сетки X
        const xValues = probe.map((_, i) => startX + i * (endX - startX) / (probe.length - 1));

        // 1. Получаем базовый точный каркас через МНК
        const baseK = this.#fitPolynomialOLS(xValues, probe, degree);
        
        // 2. Сглаживаем паразитные изгибы вверх
        return this.#refineMonotonicity(baseK, xValues, probe, startX, endX, degree);
    }
}
