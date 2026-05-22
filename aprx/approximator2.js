const

getPolyEvaluator = K => v => K.reduce((a, k) => a * v + k),

normalize = D => {
	const [X0,Y0] = D.at( D.length >> 1 ), // take zeros from the middle
		[X1,Y1] = D.at(-1),
		
		kX = X1-X0, // e.g. 800-1200 => X0=800, kX=400
		kY = 1; //Y1-Y0;
		
		//kY = Y0*Y0 > Y1*Y1 ? Y0 : Y1;
		
	return { X0, kX, Y0, kY, D:D.map( ([x,y]) => [ (x-X0)/kX, (y-Y0)/kY ] ) }
	
},

gaussianElimination = (M, V) => {
	const n = V.length;
	for (let i = 0; i < n; i++) {
		let maxEl = Math.abs(M[i][i]),
		maxRow = i;
		for (let k = i + 1; k < n; k++) {
			if (Math.abs(M[k][i]) > maxEl) {
				maxEl = Math.abs(M[k][i]);
				maxRow = k;
			}
		}
		[M[i], M[maxRow]] = [M[maxRow], M[i]];
		[V[i], V[maxRow]] = [V[maxRow], V[i]];

		for (let k = i + 1; k < n; k++) {
			const c = -M[k][i] / M[i][i];
			for (let j = i; j < n; j++)
				M[k][j] = (i === j) ? 0 : M[k][j] + c * M[i][j];
			V[k] += c * V[i];
		}
	}
	const K = new Array(n).fill(0);
	for (let i = n - 1; i >= 0; i--) {
		K[i] = V[i] / M[i][i];
		for (let k = i - 1; k >= 0; k--)
			V[k] -= M[k][i] * K[i];
	}
	return K;
},

fitXY = (X=null, Y, degree) => {
	
	if(!X) X = Array.from( Y, i=>i/Y.length );
	
	const n = X.length,
	m = degree + 1;
	const M = Array.from({
		length: m
	}, () => new Array(m).fill(0));
	const V = new Array(m).fill(0);

	for (let i = 0; i < n; i++) {

		const x = X[i],
		y = Y[i],
		powers = [];

		for (let p = 0; p <= 2 * degree; p++)
			powers[p] = Math.pow(x, p);

		for (let row = 0; row < m; row++) {
			const pRow = degree - row;
			for (let col = 0; col < m; col++)
				M[row][col] += powers[pRow + (degree - col)];
			V[row] += y * powers[pRow];
		}
	}
	return gaussianElimination(M, V);
},

fitD = (D, degree ) => {
		
	const
	n = D.length,
	m = degree + 1;
	
	const M = Array.from({length: m}, () => new Array(m).fill(0));
	const V = new Array(m).fill(0);
	
	D.forEach( ([x,y]) => {
		const powers = [];

		for (let p = 0; p <= 2 * degree; p++) powers[p] = Math.pow(x, p);

		for (let row = 0; row < m; row++) {
			const pRow = degree - row;
			for (let col = 0; col < m; col++)
				M[row][col] += powers[pRow + (degree - col)];
			V[row] += y * powers[pRow];
		}
	});

	return gaussianElimination(M, V);
},

polyDerivative = (K, x, degree) => K.slice(0, -1).map((k, i) => k * (degree - i)).reduce((a, k) => a * x + k, 0),

learnConfig = {
	lr: 0.1,
	epochs: 300,
	penaltyWeight: 1000000,
	h: 0.0001
},

refineMonotonicity = (X, Y, baseK, degree) => {
	const
	K = [...baseK],
	startX = X.at(0),
	endX = X.at(-1);

	const lossFunction = (currentK) => {
		let error = 0;
		const f = getPolyEvaluator(currentK);

		for (let i = 0; i < X.length; i++)
			error += Math.pow(f(X[i]) - Y[i], 2);

		for (let x = startX; x <= endX; x += 0.01) {
			const deriv = polyDerivative(currentK, x, degree);
			if (deriv > 0)
				error += penaltyWeight * Math.pow(deriv, 2);
		}
		return error;
	};

	for (let step = 0; step < epochs; step++) {
		const grad = new Array(K.length).fill(0);
		for (let i = 0; i < K.length; i++) {
			K[i] += h;
			const lHigh = lossFunction(K);
			K[i] -= 2 * h;
			const lLow = lossFunction(K);
			K[i] += h;
			grad[i] = (lHigh - lLow) / (2 * h);
		}
		for (let i = 0; i < K.length; i++)
			K[i] -= lr * grad[i];
	}
	return K;
},

monotonous = (X, Y, degree = 5) => {
	const baseK = fitPolynomialOLS(X, Y, degree);
	return refineMonotonicity(xValues, yValues, baseK, degree);
}

export {
	normalize,
	fitXY, fitD,
	getPolyEvaluator,
	monotonous
};
