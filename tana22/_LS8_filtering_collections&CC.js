var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')


//_____________________________________________________________________________________

/*var coll = ee.ImageCollection('LANDSAT/LC08/C02/T1')
  .filterBounds(GT)
  .filterDate('2017-01-01', '2017-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20));
  /*.sort('CLOUD_COVER') //sorts for the earliest and least cloudy image
  .first());*/
  
  
/*Map.centerObject(GT, 13);
var bands = coll.select('B4', 'B3', 'B2')
var vizPar = { 
  min: 5000, 
  max: 15000, 
  gamma: 1.3
};

//Add a whole image collection to Map --> useful to check on CC
function addImage(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B3', 'B2', 'B1'],  min: 5000, max: 15000, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

coll.evaluate(function(coll) {  // use map on client-side
  coll.features.map(addImage)
})
print(coll, 'c2');*/


//______________________________________________________________________


//filter for cloud cover over ROI
//
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_RT_TOA")
    .filterBounds(GT)
    .filterDate('2013-01-01', '2022-01-01');
    
print(dataset)

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


var withCloudiness = dataset.map(ROICC)

var filteredCollection = withCloudiness.filter(ee.Filter.lte('cloud', 2));//'cloud'
print(filteredCollection, 'fC');

function addImageTOA(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.4, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

filteredCollection.evaluate(function(filteredCollection) {  // use map on client-side
  filteredCollection.features.map(addImageTOA)
})