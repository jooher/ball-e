let svg, ctm, T = null, pinch, events;

const
	getMousePosition = (e,sub) => {
		
		if (e.touches)
			e = e.touches[0];

		return {
			x: (e.clientX - ctm.e) / ctm.a - sub.x,
			y: (e.clientY - ctm.f) / ctm.d - sub.y
		};
	},

	start = e => {
		pinch = getMousePosition(e,{x:T.matrix.e, y:T.matrix.f});
		if(events.start)
			events.start(T);
	},
	
	drag = e => {
		if (!pinch) return;
		//e.preventDefault();
		console.log("drag");
		const {x,y} = getMousePosition(e,pinch);
		T.setTranslate(x,0); //y
		if(events.drag)
			events.drag(T);
	},
	
	end = e =>{
		if(!pinch)return;
		if(events.end)
			events.end(T);
		pinch = null;
	},
	
dragEvents = {
	mousedown: start,
	mousemove:drag,
	mouseup:end,
	mouseleave:end,
	
	touchstart:start,
	touchmove:drag,
	touchend:end,
	touchleave:end,
	touchcancel:end
},

translation = tgt => {
	
	const b = tgt.transform.baseVal;
		
	if( !b.length || b[0].type !== SVGTransform.SVG_TRANSFORM_TRANSLATE)
		b.insertItemBefore(svg.createSVGTransform(), 0).setTranslate(0, 0);
	
	return b.getItem(0);
};

export {translation};

export default (aSvg,tgt,handlers) => {
	svg = aSvg;
	ctm = svg.getScreenCTM();
	T = translation(tgt);
		
	events = handlers;
	for(const e in dragEvents)
		svg.addEventListener(e,dragEvents[e]);
};

