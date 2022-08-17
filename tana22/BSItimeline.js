
//import USGS DEM file. calculate slope and establish masks for filtering bf for viable areas for rice fields
ee.Image("USGS/SRTMGL1_003")

var dataset = ee.Image('USGS/SRTMGL1_003');
var elevation = dataset.select('elevation');
var slope = ee.Terrain.slope(elevation);
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var elevationTana = elevation.clip(GT);
var lowlands = elevationTana.lte(1260)
  .selfMask()
  .rename('lowlands');
var slopeTana = slope.clip(GT)
var flatlands = slopeTana.lte(10)
  .selfMask()
  .rename('flatlands')
var flatgeo = flatlands.reduceToVectors({scale: 30, labelProperty: null })
var viable = lowlands.clip(flatgeo)
var viablegeo = viable.reduceToVectors({geometry: GT, scale: 30, labelProperty: null})

//Landsat iles
var Landsat21 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20210530');//may2021
var Landsat20 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20200527');//May 2020 (LC08_L1TP_159073_20200628_20200708_01_T1 ; LC08_L1TP_159073_20200714_20200722_01_T1)
var Landsat19 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20180623');//June 2019 <--highCC
var Landsat18 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20180506');//May 2018 (LC08_L1TP_159073_20180607_20180615_01_T1 ; LC08_L1TP_159073_20180623_20180703_01_T1)
var Landsat17 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20170807');//<-- highCC
var Landsat16 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20160719');//July 2016
var Landsat15 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20150615');//June 2015
var Landsat14 = ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20140527');//may2014

// Create a collection with fromImages().
var images = ee.ImageCollection.fromImages([
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20210530'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20200527'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20180623'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20180506'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20170807'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20160719'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20150615'),
  ee.Image('LANDSAT/LC08/C01/T1/LC08_159073_20140527')
  ]);
print('images: ', images);


//____________________________________

//specify image & year!!
var Landsat = Landsat21
var imgyr = '2021'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'ffffff'}, 'backfill areas' +imgyr);

//_____________________________________

//specify image & year!!
var Landsat = Landsat20
var imgyr = '2020'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'ecd9d9'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat19
var imgyr = '2019'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'd9b2b2'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat18
var imgyr = '2018'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'c68c8c'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat17
var imgyr = '2017'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'b36666'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat16
var imgyr = '2016'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: 'a04040'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat15
var imgyr = '2015'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: '8d1a1a'}, 'backfill areas' +imgyr);
//_____________________________________

//specify image & year!!
var Landsat = Landsat14
var imgyr = '2014'
//2.### INDEX CALCULATIONS TO IDENTIFY BARE SOIL AND BACKFILLS
//BSI calculation
var BSI = Landsat.expression(
    '((RED +SWIR1) - (NIR + BLUE)) / ((RED + SWIR1) + (NIR + BLUE))', {
      'NIR': Landsat.select('B5'),
      'RED': Landsat.select('B4'),
      'BLUE': Landsat.select('B2'),
      'SWIR1' : Landsat.select('B6')
});

//3.clip and filter BSI
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
var clipBSI = BSI.clip(GT)
var backfill = clipBSI.gt(0.1)
  .selfMask()
  .rename('backfill');
  backfill = backfill.clip(viablegeo)
Map.addLayer(backfill, {palette: '800000'}, 'backfill areas' +imgyr);
// 4. add map layers
