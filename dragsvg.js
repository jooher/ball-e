const
	getMousePosition = (e,sub) => {
		
		if (e.touches)
			e = e.touches[0];

		return {
			x: (e.clientX - ctm.e) / ctm.a - sub.x,
			y: (e.clientY - ctm.f) / ctm.d - sub.y
		};
}

let svg, ctm, tgt, T = null, pinch, events;


const	
	start = e => {
		
		const target = (tgt||e.target),
			b = target.transform.baseVal;
			
		if (!target.classList.contains('draggable'))return;		
			
		if( !b.length || b[0].type !== SVGTransform.SVG_TRANSFORM_TRANSLATE)
			T=b.insertItemBefore(svg.createSVGTransform(), 0).setTranslate(0, 0);
			
		T = b.getItem(0);
		pinch = getMousePosition(e,{x:T.matrix.e, y:T.matrix.f});
		
		if(events.start)
			events.start(T);
	},
	
	drag = e => {
		if (!T) return;
		e.preventDefault();
		const {x,y} = getMousePosition(e,pinch);
		T.setTranslate(x, y);
		if(events.drag)
			events.drag(T);
	},
	
	end = e =>{
		if(!T)return;
		if(events.end)
			events.end(T);
		T = null;
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
}

export default (el,pin,handlers) => {
	svg = el;
	ctm = svg.getScreenCTM();
	tgt = pin;
		
	events = handlers;
	for(const e in dragEvents)
		svg.addEventListener(e,dragEvents[e]);
}

