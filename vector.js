const
 vector = (x,y,z) => ({x,y,z}),
 vscale = (k,v) => ({x:k*v.x, y:k*v.y, z: k*v.z}),
 vdot = (u,v) => ({x:u.x*v.x, y:u.y*v.y, z:u.z*v.z}),
 vmod = v => vdot(v,v);

/*
#define MULTIPLY(a, v)   (vector((a)*(v.x), (a)*(v.y), (a)*(v.z)))

 #define DOT_X(u, v)      ((u.x)*(v.x))
#define DOT_Y(u, v)      ((u.y)*(v.y))
#define DOT_Z(u, v)      ((u.z)*(v.z))
#define DOT(u, v)        (DOT_X(u, v) + DOT_Y(u, v) + DOT_Z(u, v))
#define MODULUS(v)       (DOT(v, v))
#define LENGTH(v)        (sqrt(MODULUS(v)))
#define CROSS_X(u, v)    ((u.y)*(v.z) - (u.z)*(v.y))
#define CROSS_Y(u, v)    ((u.z)*(v.x) - (u.x)*(v.z))
#define CROSS_Z(u, v)    ((u.x)*(v.y) - (u.y)*(v.x))
#define CROSS(u, v)      (vector(CROSS_X(u, v), CROSS_Y(u, v), CROSS_Z(u, v)))
#define STRIPLE(u, v, w) (DOT((u), CROSS((v), (w))))
#define VTRIPLE(u, v, w) (CROSS((u), CROSS((v), (w))))
#define ADD(u, v)        (vector((u.x)+(v.x), (u.y)+(v.y), (u.z)+(v.z)))
#define SUBTRACT(u, v)   (vector((u.x)-(v.x), (u.y)-(v.y), (u.z)-(v.z)))
#define REVERSE(u)       (vector(-u.x, -u.y, -u.z))
#define DISTANCE(u, v)   (LENGTH(SUBTRACT(u, v)))
*/