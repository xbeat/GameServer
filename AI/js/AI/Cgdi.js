/**
 *  Desc:   A singleton class to help alleviate the tedium of using the
 *          rendering,
 * 
 */

class Cgdi {
           
    //constructor is private
    constructor() {

		this.m_BlackPen = this.Color( 0, 0, 0 );
		this.m_WhitePen = this.Color( 255, 255, 255 );
		this.m_RedPen = this.Color( 255, 0, 0 );
		this.m_BluePen = this.Color( 0, 0, 255 );
		this.m_BrownPen = this.Color( 133, 90, 0 );

		this.m_BlackBrush = this.Color( 0, 0, 0 );
		this.m_WhiteBrush = this.Color( 255, 255, 255 );
		this.m_RedBrush = this.Color( 255, 0, 0 );
		this.m_BlueBrush = this.Color( 0, 0, 255 );
		this.m_BrownBrush = this.Color( 133, 90, 0 );

		this.m_Context = null;

    };

	Color( r, g, b ) {
		return "rgb(" + r + "," + g + "," + b + ")";
	};

	clearRect( left, top, width, height ){
		this.m_Context.clearRect( left, top, width, height );    
	};

	WhitePen() {
		this.SelectObject( this.m_WhitePen, false );
	};

	RedPen() {
		this.SelectObject( this.m_RedPen, false );
	};

	BluePen() {
		this.SelectObject( this.m_BluePen, false );
	};

	RedBrush() {
		this.SelectObject( this.m_RedBrush, true );
	};

	BlueBrush() {
		this.SelectObject( this.m_BlueBrush, true );
	};

	BrownBrush() {
		this.SelectObject( this.m_BrownBrush, true );
	};

	BlackBrush() {
		this.SelectObject( this.m_BlackBrush, true );
	};

    SelectObject( color, brush ) {

        if ( brush ) {
            this.BrushColor = color;
        } else {
            this.BrushColor = null;
            this.PenColor = color;
        };

    };

    //ALWAYS call this before drawing
    StartDrawing( context ) {
        this.m_Context = context;
    }

    ClosedShape( points ) {

        this.m_Context.strokeStyle = this.PenColor;
        this.m_Context.beginPath();
        this.m_Context.moveTo( points[0].x, points[0].y );
        for( let item = 1; item < points.length; item++ ){ 
            this.m_Context.lineTo( points[item].x, points[item].y );
        };
        this.m_Context.closePath();
        this.m_Context.stroke();

    };

    Circle( pos, radius ) {

        this.m_Context.strokeStyle = this.PenColor;

        this.m_Context.beginPath();
        this.m_Context.arc(
                    pos.x,
                    pos.y,
                    radius,
                    0,
                    2 * Math.PI );

        if ( this.BrushColor != null ) {
            this.m_Context.fillStyle = this.BrushColor; 
            this.m_Context.fill();
        };

        this.m_Context.stroke();
        this.m_Context.closePath();

    };

};

let gdi = new Cgdi();