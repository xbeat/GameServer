class Pitch{

    constructor(){
        //http://www.fifa.com/img/worldfootball/lotg/law1/Law1_Page13_01.jpg
        let canvasPitch = document.createElement( "canvas" );
        document.body.appendChild( canvasPitch );
        canvasPitch.style.position = "absolute";
        canvasPitch.style.top = "60px";
        canvasPitch.style.left = "365px";
        canvasPitch.style.zIndex = "0";
        canvasPitch.style.backgroundColor = "#009900";    
        canvasPitch.width = 1000;
        canvasPitch.height = 600;
        let contextPitch = canvasPitch.getContext('2d');
        let ratio = 2.5;
        let offsetY = 20;

        //Pitch
        contextPitch.strokeStyle = '#fff';
        contextPitch.fillStyle = '#f00';
        contextPitch.lineWidth = 1.5;
        contextPitch.rect(20 * ratio, 0 * ratio + offsetY, 360 * ratio, 225 * ratio);
        contextPitch.stroke();

        //Center
        contextPitch.beginPath();
        contextPitch.arc(192 * ratio + offsetY, 112.5 * ratio + offsetY, 30 * ratio, 0, 2 * Math.PI, false); //big circle
        contextPitch.moveTo(192 * ratio + offsetY, 0 * ratio + offsetY);
        contextPitch.lineTo(192 * ratio + offsetY, 225 * ratio + offsetY);//center line
        contextPitch.stroke();
        contextPitch.beginPath();
        contextPitch.arc(192 * ratio + offsetY, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false); //small circle
        contextPitch.stroke();

        //Big area
        contextPitch.rect(20 * ratio, 41.25 * ratio + offsetY, 54 * ratio, 142 * ratio); //left
        contextPitch.rect(326 * ratio, 41.25 * ratio + offsetY, 54 * ratio, 142 * ratio); //right

        //Small area
        contextPitch.rect(20 * ratio, 82 * ratio + offsetY, 18 * ratio, 60 * ratio); //left
        contextPitch.rect(362 * ratio, 82 * ratio + offsetY, 18 * ratio, 60 * ratio); //right
        contextPitch.stroke();

        //circle area
        contextPitch.beginPath()
        contextPitch.arc(56 * ratio, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false); //left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc(344 * ratio, 112.5 * ratio + offsetY, 1 * ratio, 0, 2 * Math.PI, false); //right
        contextPitch.stroke();

        //semi circle 
        contextPitch.beginPath()
        contextPitch.arc(46 * ratio, 112.5 * ratio + offsetY, 40 * ratio, -0.25 * Math.PI, 0.25 * Math.PI, false); //left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc(354 * ratio, 112.5 * ratio + offsetY, 40 * ratio, 0.75 * Math.PI, 1.25 * Math.PI, false); //left
        contextPitch.stroke();

        //corner
        contextPitch.beginPath()
        contextPitch.arc(20 * ratio, 0 + offsetY, 7 * ratio, 0 * Math.PI, 0.50 * Math.PI, false);//top left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc(20 * ratio, 225 * ratio + offsetY, 7 * ratio, -0.50 * Math.PI, 0 * Math.PI, false);//bottom left
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc(380 * ratio, 0 + offsetY, 7 * ratio, 0.50 * Math.PI, 1 * Math.PI, false);//top right
        contextPitch.stroke();
        contextPitch.beginPath()
        contextPitch.arc(380 * ratio, 225 * ratio + offsetY, 7 * ratio, 1 * Math.PI, 1.50 * Math.PI, false);//bottom right
        contextPitch.stroke();

        //Golie
        contextPitch.rect(12 * ratio, 97 * ratio + offsetY, 8 * ratio, 24 * ratio + offsetY); //left
        contextPitch.rect(380 * ratio, 97 * ratio + offsetY, 8 * ratio, 24 * ratio + offsetY); //right
        contextPitch.stroke();

        //external line
        contextPitch.moveTo(12 * ratio, 24 * ratio + offsetY);
        contextPitch.lineTo(20 * ratio, 24 * ratio + offsetY);//top left
        contextPitch.stroke();

        contextPitch.moveTo(12 * ratio, 201 * ratio + offsetY);
        contextPitch.lineTo(20 * ratio, 201 * ratio + offsetY);//bottom left
        contextPitch.stroke();

        contextPitch.moveTo(380 * ratio, 24 * ratio + offsetY);
        contextPitch.lineTo(388 * ratio, 24 * ratio + offsetY);//top right
        contextPitch.stroke();

        contextPitch.moveTo(380 * ratio, 201 * ratio + offsetY);
        contextPitch.lineTo(388 * ratio, 201 * ratio + offsetY);//bottom right
        contextPitch.stroke();
    };
};

let pitch = new Pitch();

