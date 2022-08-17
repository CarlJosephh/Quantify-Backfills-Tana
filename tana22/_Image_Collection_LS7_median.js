var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')

var dataset = ee.ImageCollection("LANDSAT/LE07/C02/T1_TOA")
    .filterBounds(GT)
    //.filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    .filter(ee.Filter.calendarRange(10, 5, 'month'))
print(dataset, 'dataset')

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image
      .updateMask(qaMask)
      .updateMask(saturationMask);
}

var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.filter(ee.Filter.lte('cloud', 25));//'cloud'
print(cloudfreeImage, 'fC', false);
var Landsat21 = cloudfreeImage.filterDate('2020-10-01', '2021-05-01').median().set('system:id', 'RS2021') //ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530');//(")may2021
var Landsat20 = cloudfreeImage.filterDate('2019-10-01', '2020-05-01').median().set('system:id', 'RS2020')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20200527');//(")May 2020 (LC08_L1TP_159073_20200628_20200708_01_T1 ; LC08_L1TP_159073_20200714_20200722_01_T1)
var Landsat19 = cloudfreeImage.filterDate('2018-10-01', '2019-05-01').median().set('system:id', 'RS2019')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20190610');//(")!!! June 2019 ,LC08_159073_20190610, <--highCC
var Landsat18 = cloudfreeImage.filterDate('2017-10-01', '2018-05-01').median().set('system:id', 'RS2018')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506');//(")May 2018 (LC08_L1TP_159073_20180607_20180615_01_T1 ; LC08_L1TP_159073_20180623_20180703_01_T1)
var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-31').median().set('system:id', 'RS2017')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC
var Landsat16 = cloudfreeImage.filterDate('2015-10-01', '2016-05-01').median().set('system:id', 'RS2016')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160617');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160719')July 2016
var Landsat15 = cloudfreeImage.filterDate('2014-10-01', '2015-05-01').median().set('system:id', 'RS2015')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20150615');//(")June 2015
var Landsat14 = cloudfreeImage.filterDate('2013-10-01', '2014-05-01').median().set('system:id', 'RS2014')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20140527');//(")may2014
var Landsat13 = cloudfreeImage.filterDate('2012-10-01', '2013-05-01').median().set('system:id', 'RS2013')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609');//(")may2014
var Landsat12 = cloudfreeImage.filterDate('2011-10-01', '2012-05-01').median().set('system:id', 'RS2013')
var Landsat11 = cloudfreeImage.filterDate('2010-10-01', '2011-05-01').median().set('system:id', 'RS2013')
var Landsat10 = cloudfreeImage.filterDate('2009-10-01', '2010-05-01').median().set('system:id', 'RS2013')
var Landsat9 = cloudfreeImage.filterDate('2008-10-01', '2009-05-01').median().set('system:id', 'RS2013')
var Landsat8 = cloudfreeImage.filterDate('2007-10-01', '2008-05-01').median().set('system:id', 'RS2013')
var Landsat7 = cloudfreeImage.filterDate('2006-10-01', '2007-05-01').median().set('system:id', 'RS2013')
var Landsat6 = cloudfreeImage.filterDate('2005-10-01', '2006-05-01').median().set('system:id', 'RS2013')
var Landsat5 = cloudfreeImage.filterDate('2004-10-01', '2005-05-01').median().set('system:id', 'RS2013')
var Landsat4 = cloudfreeImage.filterDate('2003-10-01', '2004-05-01').median().set('system:id', 'RS2013')
var Landsat3 = cloudfreeImage.filterDate('2002-10-01', '2003-05-01').median().set('system:id', 'RS2013')
var Landsat2 = cloudfreeImage.filterDate('2001-10-01', '2002-05-01').median().set('system:id', 'RS2013')
var Landsat1 = cloudfreeImage.filterDate('2000-10-01', '2001-05-01').median().set('system:id', 'RS2013')

var LS8export = ee.ImageCollection.fromImages([
  Landsat21,
  Landsat20,
  Landsat19,
  Landsat18,
  Landsat17,
  Landsat16,//all of these images except Landsat13 are ok. for 13 there are too many cloud gaps (probably too little images over the time period)
  Landsat15,
  Landsat14,
  Landsat13,
  Landsat12,
  Landsat11,
  Landsat10,
  Landsat9,
  Landsat8,
  Landsat7,
  Landsat6,
  Landsat5,
  Landsat4,
  Landsat3,
  Landsat2,
  Landsat1
]);

LS8export = LS8export.map(function(image){
                              var image = image.clip(GT);
                              return image
  
})

print('LS8export: ', LS8export);


var list = LS8export.toList(LS8export.size());
print(list, 'image list')

/*function addImage(image) { // display each image in collection
  var id = image.id
  image = ee.Image(list.get());
  Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.4, gamma: 1.3}, id)//.slice(-8))//get('DATE_ACQUIRED')
}

list.evaluate(function(list) {  // use map on client-side
  list.features.map(addImage)
});*/
var VizParams = {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}

var name = Landsat5.get('system:id')
Map.addLayer(ee.Image(list.get(0)), VizParams, '2021', false)
Map.addLayer(ee.Image(list.get(1)), VizParams, '2020', false)
Map.addLayer(ee.Image(list.get(2)), VizParams, '2019', false)
Map.addLayer(ee.Image(list.get(3)), VizParams, '2018', false)
Map.addLayer(ee.Image(list.get(4)), VizParams, '2017')
Map.addLayer(ee.Image(list.get(5)), VizParams, '2016', false)
Map.addLayer(ee.Image(list.get(6)), VizParams, '2015', false)
Map.addLayer(ee.Image(list.get(7)), VizParams, '2014', false)
Map.addLayer(ee.Image(list.get(8)), VizParams, '2013', false)
Map.addLayer(ee.Image(list.get(9)), VizParams, '2012', false)
Map.addLayer(ee.Image(list.get(10)), VizParams, '2011', false)
Map.addLayer(ee.Image(list.get(11)), VizParams, '2010', false)
Map.addLayer(ee.Image(list.get(12)), VizParams, '2009', false)
Map.addLayer(ee.Image(list.get(13)), VizParams, '2008', false)
Map.addLayer(ee.Image(list.get(14)), VizParams, '2007', false)
Map.addLayer(ee.Image(list.get(15)), VizParams, '2006', false)
Map.addLayer(ee.Image(list.get(16)), VizParams, '2005', false)
Map.addLayer(ee.Image(list.get(17)), VizParams, '2004', false)
Map.addLayer(ee.Image(list.get(18)), VizParams, '2003', false)
Map.addLayer(ee.Image(list.get(19)), VizParams, '2002', false)
Map.addLayer(ee.Image(list.get(20)), VizParams, '2001', false)
