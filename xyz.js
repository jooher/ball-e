class XYZ {
	
	constructor(x,y,z) {
		this.x = x,
		this.y = y,
		this.z = z
	}
	
	app( {x,y,z}, k=1 ) {
		this.x += x*k,
		this.y += y*k,
		this.z += z*k;
		return this;
	}
	
	scale (k) {
		this.x*=k;
		this.y*=k;
		this.z*=k;
		return this;
	}
}

export const 
	xyz	= (x,y,z) => new XYZ(x||0,y||0,z||0),
	scale	= (k,v) => xyz( k*v.x, k*v.y, k*v.z ),
	dot	= (u,v) => u.x*v.x + u.y*v.y + u.z*v.z,
	mod	= v => dot(v,v),
	len	= v => Math.sqrt(mod(v)),
	add	= (u,v) => xyz(u.x+v.x, u.y+v.y, u.z+v.z),
	sub	= (u,v) => xyz(u.x-v.x, u.y-v.y, u.z-v.z),
	product = (u,v) => xyz( u.y*v.z-u.z*v.y, u.x*v.z-u.z*v.x, u.x*v.y-u.y*v.x );