/***********************************************************
/* Author : Mike Robinson, mike@rekim.com, @mike_robbo    **
/* Description: Ubuntu folding Origami effect.            **
/***********************************************************/

/*
	IMAGES USED ARE 100% SCALE. THE SAME SIZE AS THE CANVAS 
*/
var saveToURL = "";

/* leave stage empty unless you're using createjs */
var UbuntuOrigami = function( _canvas, _image, _stage )
{

	//This is called every time the play head reaches the extremeties.
	//That includes loops and pingpongs
	this.onComplete = null;

	this.onOpen = null;
	this.createJSContainer = _stage;
	this.landscape = false;
	var settledKeyframe = 1;
	var paramCount = 9;
	var restFrameParam = 8;
	var fadeFrameParam = 7;
	var frameCount = 160;
	var nativeSizeX = 1296;
	var nativeSizeY = 1920;
	
	//switch values for landscape/landscape
	this.pingPong = false;
	var pingPongForwards = true;
	var FPS = 1/30;
	var forwards = true;
	this.loop = 0;
	var loopCount = 0;
	var currentFrame = 0;
	var snapToFrames = false;
	var currentTime = 0;
	var totalTime = frameCount * FPS;
	var manageDraw = false;
	var scaleValuesX = 1;//3.8;
	var scaleValuesY = 1;//3.8;
	var offsetX = 0;
	var offsetY = 0;

	var keyframeFrom = 0;
	var keyframeTo = 1;
	var forceRefresh = false;
	var canvas = _canvas;
	var ctx = canvas.getContext("2d");
	var stage = _stage;
	var image = _image;
	var outputFileName = "origamiOutputHuge";
	var lastFrame = -1;
	var saveFileNum = 0;
	var useCreateJS = _stage != null;
	var shouldOutputPngs = false;
	var triangleList = [];
	var timer = null;
	var keyframeSet2StartFrame = 70;
	var inMidSection = false;


	UbuntuOrigami.DATA_PORTRAIT = [[63,1301,1731,1064,1925,1159,1850,1,false,69,1299,1730,1063,1923,1299,1925,0,true,151,1299,1730,1063,1923,1299,1925,0,false,156,1297,1729,1294,1846,1297,1927,1,false,],
[57,1048,1670,1196,1819,1192,1826,1,false,63,1048,1672,1191,1826,1302,1734,0,true,147,1048,1672,1191,1826,1302,1734,0,false,151,1180,1813,1191,1826,1301,1732,1,false,],
[57,1048,1672,1197,1820,1189,1827,1,false,63,1050,1669,1197,1821,1067,1928,0,true,141,1050,1669,1198,1820,1067,1928,0,false,147,1048,1670,1197,1820,1185,1832,1,false,],
[53,1300,1444,1048,1676,1059,1687,1,false,57,1299,1443,1048,1676,1193,1827,0,false,63,1298,1443,1047,1678,1303,1744,0,true,141,1298,1443,1047,1678,1303,1744,0,false,147,1317,1714,1046,1675,1301,1744,1,false,],
[53,1052,1676,1063,1687,788,1928,1,false,57,1052,1676,1198,1823,787,1927,0,false,63,1054,1675,1075,1923,787,1926,0,true,141,1054,1675,1075,1923,787,1926,0,false,147,1050,1675,1199,1823,1066,1927,0,false,151,1185,1808,1199,1823,1065,1926,1,false,],
[43,1300,624,805,953,825,973,1,false,53,1298,623,804,953,1298,1456,0,true,116,1298,623,804,953,1298,1456,0,false,121,1118,1241,804,949,1300,1455,1,false,],
[43,419,1880,805,952,826,969,1,false,48,792,1925,804,951,1063,1206,0,false,53,791,1925,804,950,1297,1447,0,true,128,791,1925,804,950,1297,1447,0,false,141,789,1924,1045,1662,1297,1442,1,false,],
[42,811,951,316,1925,328,1936,1,false,48,809,950,316,1927,791,1927,0,true,121,809,950,316,1927,791,1927,0,false,126,808,950,783,1760,788,1930,1,false,],
[38,810,950,362,1829,374,1835,1,false,45,810,950,362,1829,553,1925,0,true,121,810,950,362,1829,553,1925,0,false,126,808,950,777,1922,793,1925,1,false,],
[36,-9,1640,373,1829,360,1833,1,false,43,-6,1638,373,1829,-6,1926,0,true,74,-6,1638,373,1829,-6,1926,0,false,81,357,1822,373,1829,363,1833,1,false,],
[36,371,1823,319,1927,358,1828,1,false,43,372,1824,323,1924,-9,1922,0,true,74,372,1824,323,1924,-9,1922,0,false,81,371,1823,317,1933,362,1827,1,false,],
[36,1033,505,1046,505,1298,-7,1,false,41,1033,506,1298,380,1297,-7,0,true,103,1033,506,1298,380,1297,-7,0,false,110,1032,501,1306,608,1117,519,1,false,],
[36,1302,632,1031,504,1042,496,1,false,41,1299,634,1031,504,1299,373,0,true,103,1299,634,1031,504,1299,373,0,false,110,1299,634,1031,501,1299,596,1,false,],
[32,1036,498,988,608,805,961,1,false,36,1032,500,1303,628,804,960,0,true,110,1032,500,1303,628,804,960,0,false,116,1060,762,1303,625,803,959,1,false,],
[30,1013,490,1303,-13,1037,512,1,false,44,685,-5,1305,-11,1036,513,0,true,89,685,-5,1305,-11,1036,513,0,false,94,992,354,1303,-13,1036,514,0,false,99,1011,421,1303,-13,1036,514,0,false,102,1028,481,1303,-14,1036,513,1,false,],
[30,-9,-4,1041,508,1018,489,1,false,44,-9,-3,1040,508,691,-5,0,true,89,-9,-3,1040,508,691,-5,0,false,94,492,222,1039,509,997,353,0,false,99,805,956,1038,505,1014,416,0,false,102,805,956,1038,505,1031,476,1,false,],
[23,724,606,751,714,740,674,1,false,27,656,315,803,959,924,573,0,false,30,655,316,806,961,1041,502,0,true,89,655,316,806,961,1041,502,0,false,94,843,397,805,961,1040,502,0,false,99,1026,492,804,961,1040,503,1,false,],
[18,747,668,747,681,154,834,1,false,27,746,668,812,960,154,832,0,true,81,746,668,812,960,154,832,0,false,89,744,666,809,962,740,672,0,false,90,744,666,809,962,740,672,1,false,],
[18,743,663,746,677,154,834,1,false,27,661,315,746,677,155,835,0,true,81,661,315,746,677,155,835,0,false,89,659,323,746,678,737,676,0,false,90,659,323,746,678,737,676,1,false,],
[8,-2,-6,161,837,180,829,1,false,18,-3,-5,161,836,746,673,0,false,27,-4,-5,162,838,665,319,0,true,81,-4,-5,162,838,665,319,0,false,89,-5,-4,745,679,663,318,0,false,94,493,221,828,684,848,399,0,false,99,938,683,1040,508,1026,492,1,false,],
[8,367,1833,162,830,179,827,1,false,18,365,1833,162,830,746,670,0,false,27,365,1833,162,829,814,953,0,true,81,365,1833,162,829,814,953,0,false,89,363,1833,743,669,812,956,0,false,94,363,1833,807,945,812,956,1,false,],
[1,-4,-14,6,1587,-4,1648,1,false,8,-4,-14,371,1833,-6,1644,0,true,74,-4,-14,371,1833,-6,1644,0,false,81,-5,-14,371,1833,359,1827,1,false,]];


UbuntuOrigami.DATA_LANDSCAPE = [[63,1731,-5,1925,232,1850,137,1,false,69,1730,-3,1923,233,1925,-3,0,true,151,1730,-3,1923,233,1925,-3,0,false,156,1729,-1,1846,2,1927,-1,1,false],[57,1670,248,1819,100,1826,104,1,false,63,1672,248,1826,105,1734,-6,0,true,147,1672,248,1826,105,1734,-6,0,false,151,1813,116,1826,105,1732,-5,1,false],[57,1672,248,1820,99,1827,107,1,false,63,1669,246,1821,99,1928,229,0,true,141,1669,246,1820,98,1928,229,0,false,147,1670,248,1820,99,1832,111,1,false],[53,1444,-4,1676,248,1687,237,1,false,57,1443,-3,1676,248,1827,103,0,false,63,1443,-2,1678,249,1744,-7,0,true,141,1443,-2,1678,249,1744,-7,0,false,147,1714,-21,1675,250,1744,-5,1,false],[53,1676,244,1687,233,1928,508,1,false,57,1676,244,1823,98,1927,509,0,false,63,1675,242,1923,221,1926,509,0,true,141,1675,242,1923,221,1926,509,0,false,147,1675,246,1823,97,1927,230,0,false,151,1808,111,1823,97,1926,231,1,false],[43,624,-4,953,491,973,471,1,false,53,623,-2,953,492,1456,-2,0,true,116,623,-2,953,492,1456,-2,0,false,121,1241,178,949,492,1455,-4,1,false],[43,1880,877,952,491,969,470,1,false,48,1925,504,951,492,1206,233,0,false,53,1925,505,950,492,1447,-1,0,true,128,1925,505,950,492,1447,-1,0,false,141,1924,507,1662,251,1442,-1,1,false],[42,951,485,1925,980,1936,968,1,false,48,950,487,1927,980,1927,505,0,true,121,950,487,1927,980,1927,505,0,false,126,950,488,1760,513,1930,508,1,false],[38,950,486,1829,934,1835,922,1,false,45,950,486,1829,934,1925,743,0,true,121,950,486,1829,934,1925,743,0,false,126,950,488,1922,519,1925,503,1,false],[36,1640,1305,1829,923,1833,936,1,false,43,1638,1302,1829,923,1926,1302,0,true,74,1638,1302,1829,923,1926,1302,0,false,81,1822,939,1829,923,1833,933,1,false],[36,1823,925,1927,977,1828,938,1,false,43,1824,924,1924,973,1922,1305,0,true,74,1824,924,1924,973,1922,1305,0,false,81,1823,925,1933,979,1827,934,1,false],[36,505,263,505,250,-7,-2,1,false,41,506,263,380,-2,-7,-1,0,true,103,506,263,380,-2,-7,-1,0,false,110,501,264,608,-10,519,179,1,false],[36,632,-6,504,265,496,254,1,false,41,634,-3,504,265,373,-3,0,true,103,634,-3,504,265,373,-3,0,false,110,634,-3,501,265,596,-3,1,false],[32,498,260,608,308,961,491,1,false,36,500,264,628,-7,960,492,0,true,110,500,264,628,-7,960,492,0,false,116,762,236,625,-7,959,493,1,false],[30,490,283,-13,-7,512,259,1,false,44,-5,611,-11,-9,513,260,0,true,89,-5,611,-11,-9,513,260,0,false,94,354,304,-13,-7,514,260,0,false,99,421,285,-13,-7,514,260,0,false,102,481,268,-14,-7,513,260,1,false],[30,-4,1305,508,255,489,278,1,false,44,-3,1305,508,256,-5,605,0,true,89,-3,1305,508,256,-5,605,0,false,94,222,804,509,257,353,299,0,false,99,956,491,505,258,416,282,0,false,102,956,491,505,258,476,265,1,false],[23,606,572,714,545,674,556,1,false,27,315,640,959,493,573,372,0,false,30,316,641,961,490,502,255,0,true,89,316,641,961,490,502,255,0,false,94,397,453,961,491,502,256,0,false,99,492,270,961,492,503,256,1,false],[18,668,549,681,549,834,1142,1,false,27,668,550,960,484,832,1142,0,true,81,668,550,960,484,832,1142,0,false,89,666,552,962,487,672,556,0,false,90,666,552,962,487,672,556,1,false],[18,663,553,677,550,834,1142,1,false,27,315,635,677,550,835,1141,0,true,81,315,635,677,550,835,1141,0,false,89,323,637,678,550,676,559,0,false,90,323,637,678,550,676,559,1,false],[8,-6,1298,837,1135,829,1116,1,false,18,-5,1299,836,1135,673,550,0,false,27,-5,1300,838,1134,319,631,0,true,81,-5,1300,838,1134,319,631,0,false,89,-4,1301,679,551,318,633,0,false,94,221,803,684,468,399,448,0,false,99,683,358,508,256,492,270,1,false],[8,1833,929,830,1134,827,1117,1,false,18,1833,931,830,1134,670,550,0,false,27,1833,931,829,1134,953,482,0,true,81,1833,931,829,1134,953,482,0,false,89,1833,933,669,553,956,484,0,false,94,1833,933,945,489,956,484,1,false],[1,-14,1300,1587,1290,1648,1300,1,false,8,-14,1300,1833,925,1644,1302,0,true,74,-14,1300,1833,925,1644,1302,0,false,81,-14,1301,1833,925,1827,937,1,false]];

	var origamiData = null;

	this.reset = function()
	{

	}

	this.getCurrentFrame = function()
	{
		return currentFrame;
	}
	this.play = function( frame )
	{
		loopCount = 0;
		if( !useCreateJS )
		{
			if( timer )
			{
				clearInterval( timer );
				timer = null;
			}
			timer = setInterval( this.update.bind(this), 1000*FPS );
		}
		
	}

	this.stop = function(frame)
	{
		if( !useCreateJS )
		{
			if( timer )
			{
				clearInterval( timer );
				timer = null;
			}
		}
		if( frame )
		{
			currentFrame = frame;
			currentTime = frame*FPS;
			this.update(0);
		}

	}
	this.update = function(dt)
	{
		if( !image )
			return;
		//Is DT here? If not then make it yourself
		if( shouldOutputPngs )
		{
			dt = 1/30;
		}
		if( !dt )
		{
			dt = 1/30;
		}
		currentTime += dt*(forwards?1:-1);
		if( currentTime < 0 )
		{
			
			if( this.pingPong )
			{
				setCurrentTime(0);
				forwards = !forwards;
			}
			else if( this.loop == 0 || loopCount < this.loop )
			{
				loopCount++;
				setCurrentTime(totalTime);
			}
			else
			{
				setCurrentTime(0);
				this.stop();
			}
			if( this.onComplete )
			{
				this.onComplete();
			}
			shouldOutputPngs = false;
		}
		else if( currentTime > totalTime )
		{
			if( this.pingPong )
			{
				forwards = !forwards;
				setCurrentTime(totalTime);
			}
			else if( this.loop == 0 || loopCount < this.loop )
			{
				loopCount++;
				setCurrentTime(0);
			}
			else
			{
				setCurrentTime(totalTime);
				this.stop();
			}

			if( this.onComplete )
			{
				this.onComplete();
			}

		}
		currentFrame = Math.floor(currentTime / FPS);

		if( currentFrame > keyframeSet2StartFrame && !inMidSection )
		{
			inMidSection = true;
			if( this.onOpen )
				this.onOpen();
		}
		else if( currentFrame <= keyframeSet2StartFrame && inMidSection)
		{
			inMidSection = false;
			if( this.onOpen )
				this.onOpen();
	
		}
		//forceRefresh = true;

		if( useCreateJS )
		{
			stage.update();
		}
		else
		{
			ctx.clearRect( 0, 0, canvas.width, canvas.height );
			for( var t=0;t<triangleList.length;t++ )
			{
				updateTriangles.call(ctx,triangleList[t]);
			}
		}
		if( shouldOutputPngs )
		{
			if( lastFrame != currentFrame )
			{
				saveFileNum++;
				saveCanvasData( canvas, outputFileName+pad(saveFileNum,4)+".png");
			}
			else
			{
				//origamiUpdate();
			}
			
		}
		

		lastFrame = currentFrame;
	}

	this.setSavePngs = function( shouldSave, savePath )
	{
		shouldOutputPngs = shouldSave;
		saveToURL = savePath;
	}

	function setCurrentTime( _newTime )
	{
		currentTime = _newTime;
		currentFrame = Math.floor(currentTime / FPS);
		resetKeyFrames();
	}

	this.setFPS = function( _FPS )
	{
		FPS = 1/_FPS
		totalTime = frameCount * FPS;
		currentTime = currentFrame * FPS
	}

	this.setImage = function( _image )

	{
		image = _image;
	}

	this.setForwards = function( _forwards )
	{
		forwards = _forwards;
	}
	this.rotateSequence = function( data )
	{
		var _od =data;
		var _pc = paramCount;
		var tempx = 0;
		for( var i=0;i<_od.length;i++)
		{
			var _layer = _od[i];
			var _currentDataLength = _layer.length;

			for( var r=1;r<_currentDataLength;r+=_pc)
			{
				for( var n=0;n<6;n+=2)
				{
					tempx = _layer[r+n];
					_layer[r+n] = _layer[r+n+1];
					_layer[r+n+1] = nativeSizeX-tempx;
				}
			}

		}
		console.log(JSON.stringify(data));
	}

	this.setSequence = function( data, _setScaleFromCanvas )
	{
		origamiData = data;

		this.landscape = origamiData == UbuntuOrigami.DATA_LANDSCAPE;

		if( _setScaleFromCanvas )
		{
			this.setScaleFromCanvas(this.landscape );
		}

		var _od =origamiData;
		var _pc = paramCount;
		var _cp = _pc;
		var _restFrame = 0;
		for( var i=0;i<_od.length;i++)
		{
			var _currentDataLength = _od[i].length;
			for( var r=restFrameParam;r<_currentDataLength;r+=_pc)
			{
				if( _od[i][r] )
				{
					_restFrame = Math.floor((r-restFrameParam)/paramCount);
					continue;
				}
			}
			_cp = _pc * _restFrame;
			createTriangle.call(this,_od[i][_cp+1],_od[i][_cp+2],_od[i][_cp+3],_od[i][_cp+4],_od[i][_cp+5],_od[i][_cp+6],image,i);
		}
		//this.landscape = origamiData == UbuntuOrigami.DATA_NEW_LANDSCAPE;
	}

	this.setSequenceSize = function( _width, _height, landscape)
	{
		if( landscape )
		{
			scaleValuesX = _width / nativeSizeY;
			scaleValuesY = _height / nativeSizeX;
		}
		else
		{
			scaleValuesX = _width / nativeSizeX;
			scaleValuesY = _height / nativeSizeY;
		}
	}

	this.setOffset = function( _x, _y )
	{
		if( this.origamiData != null )
		{
			console.log( "origami.setOffset must be called before setSequence!" );
		}
		offsetX = -_x;
		offsetY = -_y;
	}
	this.setScaleFromCanvas = function (landscape)
	{
		if( landscape )
		{
			scaleValuesX = canvas.width / nativeSizeY;
			scaleValuesY = canvas.height / nativeSizeX;
			scaleValuesX = Math.max( scaleValuesX, scaleValuesY );
			scaleValuesY = scaleValuesX;
		}
		else
		{
			scaleValuesX = canvas.width / nativeSizeX;
			scaleValuesY = canvas.height / nativeSizeY;
			scaleValuesX = Math.max( scaleValuesX, scaleValuesY );
			scaleValuesY = scaleValuesX;
		}
		
	}

	this.setSize = function (_width,_height)
	{
		scaleValuesX = _width / nativeSizeX;
		scaleValuesY = _height / nativeSizeY;
		scaleValuesX = Math.max( scaleValuesX, scaleValuesY );
		scaleValuesY = scaleValuesY;
	}

	var UVTRI = function(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2,i)
	{
		var t = this;
		t.x0 = x0*scaleValuesX+offsetX; t.x1 = x1*scaleValuesX+offsetX; t.x2 = x2*scaleValuesX+offsetX; 
		t.y0 = y0*scaleValuesY+offsetY; t.y1 = y1*scaleValuesY+offsetY; t.y2 = y2*scaleValuesY+offsetY;
		t.u0 = u0*scaleValuesX+offsetX; t.u1 = u1*scaleValuesX+offsetX; t.u2 = u2*scaleValuesX+offsetX; 
		t.v0 = v0*scaleValuesY+offsetY; t.v1 = v1*scaleValuesY+offsetY; t.v2 = v2*scaleValuesY+offsetY;

		t.i = i;
		t.changed = true;
		t.reset = true;
		t.overlayAlpha = 0.5;
		t.visible = true;
		t.to = 1;
		t.from = 0;
		t.forceRefresh = false;
		t.finished = false;
		//The D is for delta
		t.d = t.d_a = t.d_b = t.d_c = t.d_d = t.d_e = t.d_f = 0;
	}


//pD stands for PolyData
	function drawPolygon( ctx, texture, pD, colour )
	{
		if( !pD.visible )
			return;

		if( pD.changed )
		{
			//Create the cache
			pD.d = pD.u0*pD.v1 + pD.v0*pD.u2 + pD.u1*pD.v2 - pD.v1*pD.u2 - pD.v0*pD.u1 - pD.u0*pD.v2;
	        pD.d_a = (pD.x0*pD.v1 + pD.v0*pD.x2 + pD.x1*pD.v2 - pD.v1*pD.x2 - pD.v0*pD.x1 - pD.x0*pD.v2)/pD.d;
	        pD.d_b = (pD.u0*pD.x1 + pD.x0*pD.u2 + pD.u1*pD.x2 - pD.x1*pD.u2 - pD.x0*pD.u1 - pD.u0*pD.x2)/pD.d;
	        pD.d_c = (pD.u0*pD.v1*pD.x2 + pD.v0*pD.x1*pD.u2 + pD.x0*pD.u1*pD.v2 - pD.x0*pD.v1*pD.u2 - pD.v0*pD.u1*pD.x2 - pD.u0*pD.x1*pD.v2)/pD.d;
	        pD.d_d = (pD.y0*pD.v1 + pD.v0*pD.y2 + pD.y1*pD.v2 - pD.v1*pD.y2 - pD.v0*pD.y1 - pD.y0*pD.v2)/pD.d;
	        pD.d_e = (pD.u0*pD.y1 + pD.y0*pD.u2 + pD.u1*pD.y2 - pD.y1*pD.u2 - pD.y0*pD.u1 - pD.u0*pD.y2)/pD.d;
	        pD.d_f = (pD.u0*pD.v1*pD.y2 + pD.v0*pD.y1*pD.u2 + pD.y0*pD.u1*pD.v2 - pD.y0*pD.v1*pD.u2 - pD.v0*pD.u1*pD.y2 - pD.u0*pD.y1*pD.v2)/pD.d;
	        pD.changed = false;
		}
		ctx.save();
		ctx.beginPath(); ctx.moveTo(pD.x0, pD.y0 ); ctx.lineTo(pD.x1, pD.y1);
        ctx.lineTo(pD.x2, pD.y2); ctx.closePath(); ctx.clip();
        
        ctx.transform(pD.d_a, pD.d_d,
                      pD.d_b, pD.d_e,
                      pD.d_c, pD.d_f);
        ctx.drawImage(texture, 0, 0);
		
		if( pD.overlayAlpha > 0 )
		{
			ctx.fillStyle = "rgba(0, 0, 0,"+(Math.round(pD.overlayAlpha*100)/100)+")";
			ctx.fill();
		}

        ctx.restore();
	}

	function createTriangle(x1,y1,x2,y2,x3,y3, image, i )
	{
		var newTry = new UVTRI( x1,y1,x2,y2,x3,y3, x1,y1,x2,y2,x3,y3, i );
		if( useCreateJS )
		{
			var triangle = new createjs.Shape(new createjs.Graphics().inject(updateTriangles,newTry) );
			
			this.createJSContainer.addChild( triangle )
		}
		triangleList.push( newTry );
	}

	function resetKeyFrames()
	{
		for( var t=0;t<triangleList.length;t++ )
		{
			var tri = triangleList[t];
			var triData = origamiData[tri.i];
			var from = Math.floor(origamiData[tri.i].length/paramCount)-2;
			for( var i=0;i<origamiData[tri.i].length-paramCount;i+=paramCount )
			{
				var f1 = triData[i];
				var f2 = triData[i+paramCount];
				if( currentFrame < f1 || ( currentFrame >= f1 && currentFrame <= f2 ) )
				{
					from = i;
					break;
				}
			}
			if( tri.from != from)
			{
				if( tri.forwards )
				{
					tri.visible = triData[(from)*paramCount+fadeFrameParam] != 1;
				}
				else
				{
					tri.visible = triData[(from+1)*paramCount+fadeFrameParam] != 1;
				}
				//tri.visible = true;
				//triData[tri.from*paramCount+fadeFrameParam] == 1;
				tri.forceRefresh = true;
				tri.changed = true;
			}
			tri.finished = false;
			tri.from = from;
			tri.to = from+1;
			tri.overlayAlpha = 0;
		}
	}

	//If you're not using createjs this can be called directly with this as the ctx
	function updateTriangles( tri )
	{
		if(!tri.finished)
		{
			manageOrigamiEase(tri, keyframeFrom, keyframeTo);
		}
		
		drawPolygon( this,image, tri  );
	}

//ROUGH PHASE 1 EASE/FRAME MANAGEMENT
	function manageOrigamiEase( tri, keyFrameFrom, keyFrameTo )
	{
		var triData = origamiData[tri.i];
		var p;
		//This vertex is animating;
		var f1 = triData[tri.from*paramCount];
		var f2 = triData[tri.to*paramCount];
		if( forwards && currentFrame > f2 )
		{
			
			if( (tri.to+1) * paramCount < triData.length )
			{
				tri.from++;
				tri.to++;
				f1 = triData[tri.from*paramCount];
				f2 = triData[tri.to*paramCount];
				tri.forceRefresh = true;
				tri.overlayAlpha = 0;
				tri.changed = true;
				tri.visible = true;
			}
			else
			{
				tri.visible = triData[tri.to*paramCount+fadeFrameParam] != 1
				tri.finished = true;
			}
			//*/
		}
		else if( !forwards && currentFrame < f1 )
		{
			if( tri.to - 1> 0 )
			{
				tri.from--;
				tri.to--;
				f1 = triData[tri.from*paramCount];
				f2 = triData[tri.to*paramCount];
				tri.forceRefresh = true;
				tri.overlayAlpha = 0;
				tri.visible = true;
			}
			else
			{
				tri.visible = triData[tri.from*paramCount+fadeFrameParam] != 1
				tri.finished = true;
			}

			//*/
		}
		var fromParam = 0;
		var toParam = 0;
		for( var i=0;i<3;i++ )
		{
			fromParam = tri.from*paramCount;
			toParam = tri.to*paramCount;
			if( triData[fromParam+1+i*2] != triData[toParam+1+i*2] || triData[fromParam+2+i*2] != triData[toParam+2+i*2] )
			{
				

				var startTime = currentTime-(f1*FPS);
				p = startTime/((f2*FPS)-f1*FPS);
				
				//Is this a beginning frame? Fade it in.
				if( triData[fromParam+fadeFrameParam] == 1 )
				{
					tri.overlayAlpha = 0.5-p*0.5;
					tri.visible = p>=0;
				}
				//Is this a ending frame? Fade it out.
				else if( triData[toParam+fadeFrameParam] == 1 )
				{
					tri.overlayAlpha = p*0.5;
					tri.visible = p<=1;
				}
				//tri.visible = true;
				if( tri.visible )
				{
					p = Math.min(1,Math.max(0,p));
					
					tri["x"+i] = rekimEaseValue( triData[fromParam+1+i*2], triData[toParam+1+i*2],p,0 )*scaleValuesX+offsetX;
					tri["y"+i] = rekimEaseValue( triData[fromParam+2+i*2], triData[toParam+2+i*2],p,0 )*scaleValuesY+offsetY;
					tri.changed = true;
				}
			}
			else if( tri.forceRefresh )
			{
				tri["x"+i] = (triData[fromParam+1+i*2])*scaleValuesX+offsetX;
				tri["y"+i] = (triData[fromParam+2+i*2])*scaleValuesY+offsetY;
				tri.changed = true;
			}
			
		}
		tri.forceRefresh = false;
	}

}
rekimEaseValue = function( from,to,percent,ease)
{
	Math.min( 1, Math.max( 0, percent ) );
	if( ease < 0 && percent != 0 && percent != 1 )
	{
		percent *= percent*-ease+1+ease;
	}
	else if( ease > 0 && percent != 0 && percent != 1 )
	{
		percent *= (2-percent)*ease+(1-ease);
	}
	from += (to-from)*percent;
	return from;
}


//Save drivel to move out into it's own extention
function saveCanvasData( mCanvas, mFileName )
{
	console.log("saving canvas data to " + mFileName);
	var canvasData = mCanvas.toDataURL("image/png");
	var ajax = new XMLHttpRequest();
	ajax.addEventListener("load", ajaxComplete, false);
	ajax.open("POST",saveToURL+'?filename='+mFileName,false);
	ajax.setRequestHeader('Content-Type', 'application/upload');
	
	ajax.send( canvasData );
}

function ajaxComplete( evt )
{
	evt.currentTarget.removeEventListener("load", ajaxComplete, false);
}

function transferFailed(evt) {
	console.log( evt);
}
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}