var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')

var dataset = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
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

var Landsat11 = cloudfreeImage.filterDate('2010-10-01', '2011-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2010-10-01', '2011-05-01').first().get('system:id')).slice(-8))
var Landsat10 = cloudfreeImage.filterDate('2009-10-01', '2010-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2009-10-01', '2010-05-01').first().get('system:id')).slice(-8))
var Landsat9 = cloudfreeImage.filterDate('2008-10-01', '2009-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2008-10-01', '2009-05-01').first().get('system:id')).slice(-8))
var Landsat8 = cloudfreeImage.filterDate('2007-10-01', '2008-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2007-10-01', '2008-05-01').first().get('system:id')).slice(-8))
var Landsat7 = cloudfreeImage.filterDate('2006-10-01', '2007-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2006-10-01', '2007-05-01').first().get('system:id')).slice(-8))
var Landsat6 = cloudfreeImage.filterDate('2005-10-01', '2006-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2005-10-01', '2006-05-01').first().get('system:id')).slice(-8))
var Landsat5 = cloudfreeImage.filterDate('2004-10-01', '2005-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2004-10-01', '2005-05-01').first().get('system:id')).slice(-8))
var Landsat4 = cloudfreeImage.filterDate('2003-10-01', '2004-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2003-10-01', '2004-05-01').first().get('system:id')).slice(-8))
var Landsat3 = cloudfreeImage.filterDate('2002-10-01', '2003-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2002-10-01', '2003-05-01').first().get('system:id')).slice(-8))
var Landsat2 = cloudfreeImage.filterDate('2001-10-01', '2002-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2001-10-01', '2002-05-01').first().get('system:id')).slice(-8))
var Landsat1 = cloudfreeImage.filterDate('2000-10-01', '2001-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2000-10-01', '2001-05-01').first().get('system:id')).slice(-8))

var LS8export = ee.ImageCollection.fromImages([

  Landsat11,
  /*Landsat10*/
  Landsat9,
  /*Landsat8*/
  Landsat7,
  Landsat6,
  /*Landsat5*/
  Landsat4,
  /*Landsat3*/
  /*Landsat2*/
  Landsat1
]);

LS8export = LS8export.map(function(image){
                              var image = image.clip(GT);
                              return image
  
})

print('LS8export: ', LS8export);


var list = LS8export.toList(LS8export.size());
print(list, 'image list')



//Add a whole image collection to Map --> useful to check on CC
/*function addImage(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B3', 'B2', 'B1'],   min: 0.0, max: 0.4, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

LS8export.evaluate(function(LS8export) {  // use map on client-side
  LS8export.features.map(addImage)
})*/

Map.addLayer(ee.Image(list.get(0)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2011')//.slice(-8))//get('DATE_ACQUIRED')
Map.addLayer(ee.Image(list.get(1)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2009')
Map.addLayer(ee.Image(list.get(2)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2007')
Map.addLayer(ee.Image(list.get(3)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2006')
Map.addLayer(ee.Image(list.get(4)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2004')
Map.addLayer(ee.Image(list.get(5)), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3}, '2001')
